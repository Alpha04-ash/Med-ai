import { GoogleGenAI, Type, Schema } from '@google/genai';
import { medicalGuidelines } from './medical_dataset';
import { z } from 'zod';
import { env } from '../utils/env';
import { logEvent, logger } from '../utils/logger';
import { GeminiKeyManager } from '../utils/key_manager';

// Zod schema enforcing the structured output requirements
const AIOutputSchema = z.object({
    structured_notes: z.object({
        symptoms: z.array(z.string()),
        possible_causes: z.array(z.string()),
        suggested_actions: z.array(z.string()),
        confidence_score: z.number().min(0).max(100),
        is_emergency: z.boolean(),
    }),
    ai_response_text: z.string(),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;

// Shared interface matching chat format
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    image?: string; // Base64 encoded image string
}

export class AI_DocAgent {
    private static readonly MODELS = ['gemini-2.0-flash', 'gemini-flash-latest'];
    private static readonly SYSTEM_PROMPTS = {
        general: `You are the MyHealth AI General Practitioner—a friendly, empathetic, and professional medical AI.
Your objective is to provide structured medical advice, assess general symptoms, and converse safely with the patient.

STYLING & STRUCTURE RULES:
- ALWAYS use Markdown for structure.
- Use ### for Section Headings (e.g., ### 📋 Assessment, ### 💡 Recommendations).
- Use bullet points (-) for lists.
- Use **bold** for key medical terms or critical emphasize.
- Keep paragraphs short and professional.

CRITICAL SAFETY RULES:
1. DO NOT PRESCRIBE MEDICATION. EVER.
2. If symptoms are life-threatening (e.g., severe chest pain, 10/10 pain, shortness of breath), immediately instruct the patient to call emergency services and set "is_emergency" to true.
3. Be reassuring, calm, and scientific in your tone.`,

        physical: `You are the MyHealth AI Physical Therapist/Sports Medicine Specialist.
Your focus is strictly on musculoskeletal issues, physical rehabilitation, stretching, posture, and exercise recovery.
Do not diagnose internal health diseases. Provide actionable, safe physical routines and assessments.

STYLING & STRUCTURE RULES:
- ALWAYS use Markdown headings (###) for structure.
- Use bullet points for exercise steps or stretching routines.
- Use bold for anatomical terms and intensity levels.

CRITICAL SAFETY RULES:
1. DO NOT PRESCRIBE MEDICATION. EVER.
2. If injuries strongly suggest a fracture or severe tear, advise immediate physical imaging (X-ray/MRI) at a clinic.
3. Be encouraging, motivating, and highly anatomical in your explanations.`,

        mental: `You are the MyHealth AI Mental Health Counselor & Psychologist.
Your focus is strictly on emotional well-being, stress management, anxiety reduction, and cognitive behavioral techniques.

STYLING & STRUCTURE RULES:
- ALWAYS use Markdown headings (###) for structure.
- Use bullet points for grounding techniques or mindfulness steps.
- Use bold for emphasis on validation and positive coping mechanisms.

CRITICAL SAFETY RULES:
1. DO NOT PRESCRIBE PSYCHIATRIC MEDICATION.
2. If the user expresses thoughts of self-harm or severe depression, IMMEDIATELY provide emergency suicide hotline numbers and urge them to seek immediate professional help.
3. Be incredibly empathetic, gentle, non-judgmental, and validating in your tone.`
    };

    private static readonly responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            structured_notes: {
                type: Type.OBJECT,
                properties: {
                    symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    possible_causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggested_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    confidence_score: { type: Type.INTEGER },
                    is_emergency: { type: Type.BOOLEAN }
                },
                required: ["symptoms", "possible_causes", "suggested_actions", "confidence_score", "is_emergency"]
            },
            ai_response_text: { type: Type.STRING }
        },
        required: ["structured_notes", "ai_response_text"]
    };

    /**
     * Evaluates the active conversation memory and returns a safe, structured medical response.
     * Auto-retries across multiple models and API keys if failure occurs.
     */
    static async interact(
        conversationMemory: ChatMessage[],
        vitalsSnapshot?: any,
        doctorType: 'general' | 'physical' | 'mental' = 'general',
        userBaseline?: { systolic: number; diastolic: number },
        maxTotalAttempts: number = 4
    ): Promise<AIOutput> {

        // Grounding: Inject relevant clinical guidelines
        const relevantGuidelines = medicalGuidelines
            .map(g => `[GUIDELINE: ${g.title}] ${g.content}`)
            .join('\n\n');

        let systemInstruction = this.SYSTEM_PROMPTS[doctorType] + 
            `\n\n### 🛡️ CLINICAL GROUNDING DATA (STRICT ADHERENCE REQUIRED):\n${relevantGuidelines}` +
            `\n\nThe "ai_response_text" is what the user will actually hear/read. Make it empathetic and conversational.
The "structured_notes" are for internal tracking and display.`;
        
        if (userBaseline) {
            systemInstruction += `\n\nPATIENT BASELINE BLOOD PRESSURE: ${userBaseline.systolic}/${userBaseline.diastolic}. Use this to determine if current vitals are abnormal for THIS specific patient.`;
        }
        
        if (vitalsSnapshot) {
            systemInstruction += `\n\nMANDATORY INTERNAL CONTEXT - PATIENT VITALS: ${JSON.stringify(vitalsSnapshot)}`;
        }

        const geminiHistory = conversationMemory
            .filter(m => m.role !== 'system')
            .map(m => {
                const parts: any[] = [{ text: m.content }];
                if (m.image) {
                    let base64Data = m.image;
                    let mimeType = 'image/jpeg';
                    if (m.image.startsWith('data:')) {
                        const matches = m.image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            mimeType = matches[1];
                            base64Data = matches[2];
                        }
                    }
                    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                }
                return { role: m.role === 'assistant' ? 'model' : 'user', parts };
            });

        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
        let lastError: any;

        for (let attempt = 0; attempt < maxTotalAttempts; attempt++) {
            const model = this.MODELS[attempt % this.MODELS.length];
            const apiKey = GeminiKeyManager.getNextKey();
            const ai = new GoogleGenAI({ apiKey });

            try {
                logger.info(`AI_DocAgent: Using model ${model} and key ${apiKey.substring(0, 8)}... (Attempt ${attempt + 1})`);

                const response = await ai.models.generateContent({
                    model,
                    contents: geminiHistory,
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: this.responseSchema,
                        temperature: 0.3,
                    }
                });

                const rawContent = response.text;
                if (!rawContent) throw new Error('LLM returned empty content.');

                const parsedJson = JSON.parse(rawContent);
                const validatedOutput = AIOutputSchema.parse(parsedJson);

                logEvent('AI_DocAgent', `Response via ${model}`, {
                    confidence_score: validatedOutput.structured_notes.confidence_score,
                    symptoms_detected: validatedOutput.structured_notes.symptoms.length
                });

                return validatedOutput;

            } catch (err: any) {
                lastError = err;
                const isOverloaded = 
                    err.message?.includes('503') || 
                    err.message?.includes('429') ||
                    err.message?.includes('UNAVAILABLE') || 
                    err.message?.includes('overloaded') ||
                    err.message?.includes('RESOURCE_EXHAUSTED') ||
                    err.status === 503 || err.status === 429;

                logger.warn(`AI_DocAgent attempt ${attempt + 1} failed`, { error: err.message, isOverloaded });

                if (isOverloaded) {
                    GeminiKeyManager.markExhausted(apiKey);
                }

                if (attempt < maxTotalAttempts - 1) {
                    const waitMs = isOverloaded ? 1000 : 500;
                    await delay(waitMs);
                }
            }
        }

        logEvent('AI_DocAgent', 'All models/keys exhausted');
        throw new Error('All AI models are currently busy. Please try again shortly.');
    }
}

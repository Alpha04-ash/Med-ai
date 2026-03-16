import { GoogleGenAI } from '@google/genai';
import { medicalGuidelines } from './medical_dataset';
import { logger } from '../utils/logger';
import { GeminiKeyManager } from '../utils/key_manager';

export interface VisualMessage {
  role: 'user' | 'assistant';
  content: string;
  imageBase64?: string; // base64 of the uploaded/annotated image
  imageMimeType?: string;
  timestamp: Date;
}

export class VisualConsultAgent {
  private static readonly MODELS = ['gemini-2.0-flash', 'gemini-flash-latest'];

  private static readonly SYSTEM_INSTRUCTION = `You are Dr. Aura — an empathetic, expert AI visual medical consultant.
Your role is to analyze patient-submitted images (photos of affected areas, annotated body diagrams, skin conditions, visible injuries) and have an intelligent, caring medical conversation with them.

CORE BEHAVIORAL RULES:
1. VISUAL FIRST: Always describe what you see in the image before asking questions or giving advice.
2. EMPATHETIC TONE: Speak like a caring, knowledgeable doctor. Never be cold or robotic.
3. SAFE BOUNDARIES: Never diagnose definitively. Always recommend seeing a real doctor for serious concerns.
4. FOLLOW-UP QUESTIONS: Ask 1-2 specific, relevant follow-up questions per response to gather more context.
5. STRUCTURED RESPONSES: Use clear sections with emojis for readability.

RESPONSE FORMAT:
### 👁️ What I Observe
[Describe what you see in the image clearly]

### 🩺 Initial Assessment
[Your clinical impression based on visual + described symptoms]

### ❓ I Need to Know More
[1-2 targeted follow-up questions]

### ⚡ Immediate Advice
[What they should do right now — apply ice, elevate, etc.]

### 🏥 When to Seek Emergency Care
[Red flag symptoms that require immediate attention]

If there is NO image, respond conversationally and ask the user to share an image or describe their symptoms in more detail.
Always end with genuine warmth and reassurance.`;

  static async analyze(
    messages: VisualMessage[],
    userProfile?: { name: string; age: number; gender: string }
  ): Promise<string> {
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Build conversation history for Gemini
    const contents: any[] = messages.map((msg) => {
      const parts: any[] = [];
      if (msg.imageBase64 && msg.role === 'user') {
        parts.push({
          inlineData: {
            mimeType: msg.imageMimeType || 'image/jpeg',
            data: msg.imageBase64,
          },
        });
      }
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      return { role: msg.role === 'assistant' ? 'model' : 'user', parts };
    });

    const groundingData = medicalGuidelines
      .map(g => `[GUIDELINE: ${g.title}] ${g.content}`)
      .join('\n\n');

    let systemInstruction = userProfile
      ? `${this.SYSTEM_INSTRUCTION}\n\n### 🛡️ CLINICAL GROUNDING DATA (STRICT ADHERENCE REQUIRED):\n${groundingData}\n\nCURRENT PATIENT: ${userProfile.name}, ${userProfile.age} years old, ${userProfile.gender}.`
      : `${this.SYSTEM_INSTRUCTION}\n\n### 🛡️ CLINICAL GROUNDING DATA (STRICT ADHERENCE REQUIRED):\n${groundingData}`;

    let lastError: any;
    const maxAttempts = this.MODELS.length * 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const model = this.MODELS[attempt % this.MODELS.length];
      const apiKey = GeminiKeyManager.getNextKey();
      const ai = new GoogleGenAI({ apiKey });

      try {
        logger.info(`VisualAgent: Using model ${model} and key ${apiKey.substring(0, 8)}... (Attempt ${attempt + 1})`);

        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        });

        const text = response.text;
        if (!text) throw new Error('Gemini returned empty response');

        return text;
      } catch (err: any) {
        lastError = err;
        const isOverloaded =
          err.message?.includes('503') ||
          err.message?.includes('429') ||
          err.message?.includes('UNAVAILABLE') ||
          err.message?.includes('overloaded') ||
          err.message?.includes('RESOURCE_EXHAUSTED') ||
          err.status === 503 || err.status === 429;

        logger.warn(`VisualAgent: Attempt ${attempt + 1} failed`, { error: err.message, isOverloaded });

        if (isOverloaded) {
          GeminiKeyManager.markExhausted(apiKey);
        }

        if (attempt < maxAttempts - 1) {
          const waitMs = isOverloaded ? 1000 : 500;
          await delay(waitMs);
        }
      }
    }

    throw new Error(lastError?.message || 'All AI models are currently busy. Please try again.');
  }
}

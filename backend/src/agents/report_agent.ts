import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import { env } from '../utils/env';
import { logger, logEvent } from '../utils/logger';
import { GeminiKeyManager } from '../utils/key_manager';

// ─── Output Schema (Zod) ─────────────────────────────────────────────────────
const ReportOutputSchema = z.object({
    risk_score: z.number().min(0).max(100),
    classification: z.enum(['Stable', 'Monitor', 'Critical']),
    dangers: z.array(z.object({
        title: z.string(),
        desc: z.string(),
        severity: z.enum(['Low', 'Moderate', 'High']),
        action: z.string(),
    })),
    improvements: z.array(z.object({
        title: z.string(),
        desc: z.string(),
        status: z.string(),
    })),
    routine: z.array(z.string()),
    summary: z.string(),
});

export type ReportOutput = z.infer<typeof ReportOutputSchema>;

// ─── Gemini Response Schema ───────────────────────────────────────────────────
const geminiSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        risk_score: { type: Type.INTEGER },
        classification: { type: Type.STRING },
        dangers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    action: { type: Type.STRING },
                },
                required: ['title', 'desc', 'severity', 'action']
            }
        },
        improvements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    status: { type: Type.STRING },
                },
                required: ['title', 'desc', 'status']
            }
        },
        routine: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING },
    },
    required: ['risk_score', 'classification', 'dangers', 'improvements', 'routine', 'summary']
};

export class ReportAgent {
    private static readonly MODELS = ['gemini-2.0-flash', 'gemini-flash-latest'];

    /**
     * Generates a structured health risk report for the user based on their
     * profile characteristics and (optionally) their most recent vital signs.
     * Retries with exponential backoff across multiple models and API keys.
     */
    static async generate(userProfile: any, latestVitals?: any[], conversations?: any[]): Promise<ReportOutput> {
        const profileContext = `
PATIENT PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- BMI: ${(userProfile.weight / ((userProfile.height / 100) ** 2)).toFixed(1)}
- Baseline (Normal) Blood Pressure: ${userProfile.baseline_systolic}/${userProfile.baseline_diastolic}
        `.trim();

        const vitalsContext = latestVitals && latestVitals.length > 0
            ? `\nCLINICAL TELEMETRY HISTORY (Last 7 Days):\n${latestVitals.map((v: any) =>
                `  [${v.timestamp.toISOString()}] HR=${v.heart_rate}bpm, BP=${v.blood_pressure}, SpO2=${v.spo2}%, Temp=${v.temperature}°C, RR=${v.respiratory_rate}/min`
              ).join('\n')}`
            : '\nNO TELEMETRY RECORDED IN THE LAST 7 DAYS.';

        const convoContext = conversations && conversations.length > 0
            ? `\nPAST MEDICAL CONSULTATIONS & VISUAL SCANS:\n${conversations.map((c: any) => {
                let notes = "No structured data.";
                try {
                  const parsed = JSON.parse(c.structured_notes);
                  if (c.ai_doctor_id === 'visual_aura') {
                    notes = `VISUAL LAB SCAN: ${parsed.summary}`;
                  } else {
                    notes = `SYMPTOMS: ${parsed.symptoms?.join(', ') || 'N/A'}. ACTIONS: ${parsed.suggested_actions?.join(', ') || 'N/A'}.`;
                  }
                } catch (e) {}
                return `- [${c.timestamp.toISOString()}] (ID: ${c.ai_doctor_id}) ${notes}`;
              }).join('\n')}`
            : '\nNO PREVIOUS CONSULTATIONS FOUND.';

        const systemInstruction = `You are a Senior Clinical Diagnostic AI performing a "High-Fidelity Deep Scan" (Precision Medicine).
Your mission is to perform a holistic longitudinal analysis by synthesizing raw telemetry (biometrics) with qualitative patient complaints (Consultations/Visual Scans).

REALISM & CLINICAL REASONING PROTOCOLS:
1. LONGITUDINAL TEMPORAL REASONING: 
   - Identify trends over the 7-day period. Do not treat readings as isolated events.
   - Example: "SpO2 trend shows a minor but consistent decline from 99% (Mon) to 96% (Wed)."
2. CROSS-MODAL CORRELATION (HYPER-IMPORTANT):
   - Link past symptoms with biometric changes.
   - Example: "The 'throbbing headache' reported in the Visual Lab on [Date] correlates with the BP spike (155/95) recorded two hours later."
3. ANCHORING TO BASELINE:
   - Use the Patient's Baseline BP (${userProfile.baseline_systolic}/${userProfile.baseline_diastolic}) as the absolute 'Zero Point'. 
   - Flag ANY deviation beyond 15% as high-acuity, even if it falls within general "Normal" ranges.
4. CLINICAL OUTPUT TONE:
   - Use professional medical terminology (e.g., 'Hypertensive Urgency', 'Tachycardic episodes', 'Hypoxic trends').
   - Provide a "Senior Physician" summary that explains the 'WHY' behind the risk score.

RISK SCORING (0-100):
- 0-25 (Stable): Vitals consistent with baseline; no worsening trends; resolved consult issues.
- 26-60 (Monitor): Emergent negative trends; BP deviations >15%; persistent symptoms reported in consults.
- 61-100 (Critical): Acute anomalies; rapid vital degradation; severe symptoms with corresponding biometric drops.

OUTPUT FORMATTING:
- 'classification': 'Stable' | 'Monitor' | 'Critical'
- 'dangers': Include a dedicated 'title', 'desc', and 'severity'.
- 'improvements': Actionable physical or lifestyle changes.
- 'summary': A formal clinical narrative of the 7-day period.`;

        const userMessage = `TIMESTAMP: ${new Date().toISOString()}\n\n${profileContext}\n${vitalsContext}\n${convoContext}\n\nPerform the Clinical Deep Scan across all data points. PROVIDE EVIDENCE-BASED REASONING CITING SPECIFIC TIMESTAMPS.`;

        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

        let lastError: any;
        for (let attempt = 0; attempt < this.MODELS.length * 2; attempt++) {
            const model = this.MODELS[attempt % this.MODELS.length];
            const apiKey = GeminiKeyManager.getNextKey();
            const ai = new GoogleGenAI({ apiKey });

            try {
                logger.info(`ReportAgent: Trying model ${model} with key ${apiKey.substring(0, 8)}... (Attempt ${attempt + 1})`);

                const response = await ai.models.generateContent({
                    model,
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                    config: {
                        systemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: geminiSchema,
                        temperature: 0.2,
                    }
                });

                const rawContent = response.text;
                if (!rawContent) throw new Error('Gemini returned empty content');

                const parsed = JSON.parse(rawContent);
                const validated = ReportOutputSchema.parse(parsed);

                logEvent('ReportAgent', `Generated health report via ${model}`, {
                    user_id: userProfile.id,
                    risk_score: validated.risk_score,
                    classification: validated.classification,
                    dangers_count: validated.dangers.length,
                });

                return validated;

            } catch (err: any) {
                lastError = err;
                const isOverloaded = 
                    err.message?.includes('503') || 
                    err.message?.includes('429') ||
                    err.message?.includes('UNAVAILABLE') || 
                    err.message?.includes('overloaded') ||
                    err.message?.includes('RESOURCE_EXHAUSTED') ||
                    err.status === 503 || err.status === 429;
                
                logger.warn(`ReportAgent: Model ${model} failed`, { error: err.message, isOverloaded });

                if (isOverloaded) {
                    GeminiKeyManager.markExhausted(apiKey);
                }

                if (attempt < (this.MODELS.length * 2) - 1) {
                    const waitMs = isOverloaded ? 1000 : 500;
                    logger.info(`ReportAgent: Attempt failed. Retrying with next key/model in ${waitMs}ms...`);
                    await delay(waitMs);
                }
            }
        }

        logger.error('ReportAgent: All models exhausted', { error: lastError?.message });
        throw new Error('All Gemini models are currently busy. Please try again in a minute.');
    }
}

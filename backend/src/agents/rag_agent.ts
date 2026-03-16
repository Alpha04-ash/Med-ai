import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import { env } from '../utils/env';
import { logEvent, logger } from '../utils/logger';
import { medicalGuidelines, MedicalGuideline } from './medical_dataset';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const RAGResponseSchema = z.object({
    answer: z.string(),
    citations: z.array(z.object({
        title: z.string(),
        source: z.string(),
        relevance_score: z.number().min(0).max(1),
    })),
    confidence: z.number().min(0).max(100),
    grounding_strength: z.number().min(0).max(10),
});

export type RAGOutput = z.infer<typeof RAGResponseSchema> & {
    is_simulated: boolean;
    warnings?: string[];
};

export class RAGAgent {
    private static SIMULATED_DATASET = medicalGuidelines;
    private static embeddingsCache = new Map<string, number[]>();

    private static responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            answer: { type: Type.STRING },
            citations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        source: { type: Type.STRING },
                        relevance_score: { type: Type.NUMBER }
                    },
                    required: ["title", "source", "relevance_score"]
                }
            },
            confidence: { type: Type.INTEGER },
            grounding_strength: { type: Type.INTEGER }
        },
        required: ["answer", "citations", "confidence", "grounding_strength"]
    };

    private static async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await ai.models.embedContent({
                model: "text-embedding-004",
                contents: text,
            });
            return response.embeddings?.[0]?.values || Array(768).fill(0.01);
        } catch (err) {
            logger.error('Failed to generate embedding via Gemini', err);
            // Fallback dummy embedding if API fails
            return Array(768).fill(0.01);
        }
    }

    private static cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return normA && normB ? dotProduct / (normA * normB) : 0;
    }

    /**
     * Initializes the simulated database with embeddings if not already cached.
     */
    public static async initializeEmbeddings() {
        for (const doc of this.SIMULATED_DATASET) {
            if (!this.embeddingsCache.has(doc.id)) {
                const textToEmbed = `${doc.title}\n${doc.category}\n${doc.content}`;
                const embedding = await this.getEmbedding(textToEmbed);
                this.embeddingsCache.set(doc.id, embedding);
            }
        }
        logEvent('RAGAgent', `Initialized embeddings for ${this.SIMULATED_DATASET.length} guidelines`);
    }

    /**
     * Retrieves top K relevant documents using cosine similarity.
     */
    private static async retrieveDocuments(query: string, k: number = 3) {
        const queryEmbedding = await this.getEmbedding(query);

        const scoredDocs = this.SIMULATED_DATASET.map(doc => {
            const docEmbedding = this.embeddingsCache.get(doc.id);
            const score = docEmbedding ? this.cosineSimilarity(queryEmbedding, docEmbedding) : 0;
            return { ...doc, score };
        });

        const topK = scoredDocs
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .filter(doc => doc.score > 0.1); // Minimum relevance threshold

        return topK;
    }

    /**
     * Consults the RAG Agent to provide grounded medical advice.
     */
    public static async consult(userQuery: string): Promise<RAGOutput> {
        // 1. Retrieval
        if (this.embeddingsCache.size === 0) {
            await this.initializeEmbeddings();
        }

        const retrievedDocs = await this.retrieveDocuments(userQuery);

        // Formatting context for prompt
        const contextString = retrievedDocs.map((doc, idx) =>
            `[Citation ${idx + 1}] Title: ${doc.title} (Source: ${doc.source})\nContent: ${doc.content}`
        ).join('\n\n');

        const systemPrompt = `
You are the RAG Medical Knowledge Assistant.
Answer the user's healthcare query strictly based upon the provided Reference Context.

REFERENCE CONTEXT:
${contextString || "No relevant clinical guidelines found."}

INSTRUCTIONS:
1. You MUST structure your response as JSON matching the designated schema.
2. If the answer cannot be found in the context, state that clearly and assign a low confidence/grounding strength.
3. ALWAYS synthesize the information safely without diagnosing the patient.
4. Calculate 'grounding_strength' (0-10) based on how directly the context supports your answer.
`;

        logEvent('RAGAgent', 'Formed Retrieval Context', {
            retrieval_count: retrievedDocs.length,
            top_similarity: retrievedDocs[0]?.score,
            prompt_size: systemPrompt.length
        });

        // 2. Generation
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userQuery,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                    responseSchema: this.responseSchema,
                    temperature: 0.1, // Highly deterministic for factual RAG
                }
            });

            const rawJson = JSON.parse(response.text || '{}');
            const validated = RAGResponseSchema.parse(rawJson);

            // 3. Safety Post-Processing
            const finalResult: RAGOutput = {
                ...validated,
                is_simulated: true, // Disclaim that this DB is simulated
                warnings: []
            };

            if (validated.confidence < 50 || validated.grounding_strength < 5) {
                finalResult.warnings?.push("WARNING: Low confidence/grounding. This advice is insufficiently supported by evidence.");
            }

            finalResult.warnings?.push("DISCLAIMER: This information uses a simulated database and is not substitute for professional medical advice.");

            return finalResult;

        } catch (err: any) {
            logger.error('RAG Generation/Validation Failed (Gemini)', { error: err.message });
            throw new Error("Failed to generate safe, grounded medical advice.");
        }
    }
}

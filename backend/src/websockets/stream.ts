import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logEvent, logger } from '../utils/logger';
import { AI_DocAgent, ChatMessage } from '../agents/doctor_agent';
import { prisma } from '../utils/db';

// In-memory store for AI Doctor conversation context and latest vitals
const sessionMemory = new Map<string, ChatMessage[]>();
const latestVitals = new Map<string, any>();
const sessionNotes = new Map<string, any>(); // last structured_notes per session

export const initWebSocket = (server: Server) => {
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws: WebSocket, req) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const userId = url.searchParams.get('userId') || 'anonymous';
        const sessionId = url.searchParams.get('sessionId') || `sess_${Date.now()}`;

        logEvent('WebSocket', `Client connected: ${userId}`, { session_id: sessionId });

        // Initialize blank session memory (AI_DocAgent injects its native system prompt automatically)
        if (!sessionMemory.has(sessionId)) {
            sessionMemory.set(sessionId, []);
        }

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());

                if (data.type === 'vital_stream') {
                    latestVitals.set(userId, data.payload);
                    logEvent('VitalEngine', `Received vital update`, { user_id: userId, hr: data.payload.heart_rate });
                }

                else if (data.type === 'chat_message') {
                    const memory = sessionMemory.get(sessionId)!;
                    memory.push({ 
                        role: 'user', 
                        content: data.payload.text,
                        ...(data.payload.image && { image: data.payload.image })
                    });
                    sessionMemory.set(sessionId, memory);

                    logEvent('Conversation', `User message received`, { user_id: userId, session_id: sessionId });

                    try {
                        // Interact with LLM, passing the selected doctorType
                        const vitals = latestVitals.get(userId);
                        const doctorType = data.payload.doctorType || 'general';

                        // Fetch baseline for comparison
                        let baseline: any = undefined;
                        const user = await prisma.userProfile.findUnique({ where: { id: userId } });
                        if (user) {
                            baseline = { systolic: user.baseline_systolic, diastolic: user.baseline_diastolic };
                        }

                        const aiOutput = await AI_DocAgent.interact(memory, vitals, doctorType, baseline);

                        // Append AI response to memory for continued context
                        memory.push({ role: 'assistant', content: aiOutput.ai_response_text });
                        sessionMemory.set(sessionId, memory);

                        // Stream structured data back to frontend
                        ws.send(JSON.stringify({
                            type: 'chat_reply',
                            payload: aiOutput
                        }));

                        // Store the latest structured notes for this session
                        if (aiOutput.structured_notes) {
                            sessionNotes.set(sessionId, aiOutput.structured_notes);
                        }

                    } catch (err: any) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'The AI Doctor is temporarily unavailable.'
                        }));
                        logger.error('AI Interaction Failed', { error: err.message, session_id: sessionId });
                    }
                }
            } catch (err) {
                logger.error('Failed to parse WebSocket message', err);
            }
        });

        ws.on('close', async () => {
            logEvent('WebSocket', `Client disconnected: ${userId}`, { session_id: sessionId });
            
            // Save conversation into the database if interactions occurred
            const memory = sessionMemory.get(sessionId);
            if (memory && memory.length > 0) {
                try {
                    // Extract only the text content for the transcript JSON to save space
                    const textTranscript = memory.map(m => ({
                        role: m.role,
                        content: m.content
                    }));

                    // We use an arbitrary AI doctor ID since we don't have distinct AI row entries 
                    // and store the JSON transcript as a string (per SQLite schema)
                    const transcriptString = JSON.stringify(textTranscript);
                    
                    if (userId !== "demo_user") {
                        const notes = sessionNotes.get(sessionId);
                        await prisma.conversation.create({
                            data: {
                                user_id: userId,
                                ai_doctor_id: 'auto_agent',
                                transcript: transcriptString,
                                structured_notes: notes ? JSON.stringify(notes) : '{}',
                                confidence_score: notes?.confidence_score ?? 0
                            }
                        });
                        logEvent('Conversation', 'Saved session to database', { session_id: sessionId, user_id: userId });
                    }
                } catch (err: any) {
                    logger.error('Failed to save conversation to DB', { error: err.message, session_id: sessionId });
                }
            }
            
            // Cleanup memory
            sessionMemory.delete(sessionId);
            sessionNotes.delete(sessionId);
        });
    });

    logger.info('WebSocket Server initialized at /ws');
    return wss;
};

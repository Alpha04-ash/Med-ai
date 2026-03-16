import { Request, Response, NextFunction } from 'express';
import { VisualConsultAgent, VisualMessage } from '../agents/visual_agent';
import { prisma } from '../utils/db';
import { logEvent, logger } from '../utils/logger';

export class VisualConsultController {
  /**
   * POST /api/v1/visual-consult/analyze
   * Body: { userId, messages: VisualMessage[] }
   * Returns: { success, reply: string }
   */
  static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, messages } = req.body as {
        userId: string;
        messages: VisualMessage[];
      };

      if (!messages || messages.length === 0) {
        return res.status(400).json({ success: false, message: 'No messages provided.' });
      }

      // Optionally fetch user profile for personalized context
      let userProfile: any = undefined;
      if (userId) {
        const user = await prisma.userProfile.findUnique({ where: { id: userId } });
        if (user) {
          userProfile = { name: user.name, age: user.age, gender: user.gender };
        }
      }

      const reply = await VisualConsultAgent.analyze(messages, userProfile);

      // --- PERSISTENCE: Save to Conversation History ---
      if (userId && userId !== 'demo_user') {
        try {
          // Map VisualMessage to the standard text transcript format
          const textTranscript = messages.map(m => ({
            role: m.role,
            content: m.content
            // Note: We don't store base64 images in the transcript to keep DB small, 
            // but the context remains in text.
          }));
          
          // Add the final AI reply to the saved transcript
          textTranscript.push({ role: 'assistant', content: reply });

          await prisma.conversation.create({
            data: {
              user_id: userId,
              ai_doctor_id: 'visual_aura',
              transcript: JSON.stringify(textTranscript),
              structured_notes: JSON.stringify({ summary: reply.substring(0, 200) + '...' }),
              confidence_score: 95 // Default metadata
            }
          });
          logEvent('VisualConsultController', 'Saved visual consult to database', { user_id: userId });
        } catch (dbErr: any) {
          logger.error('Failed to save visual consult to DB', { error: dbErr.message });
        }
      }

      logEvent('VisualConsultController', 'Visual consult response generated', {
        user_id: userId,
        message_count: messages.length,
        has_image: messages.some(m => !!m.imageBase64),
      });

      res.status(200).json({ success: true, reply });
    } catch (err: any) {
      logEvent('VisualConsultController', 'Visual consult failed', { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/v1/visual-consult/history/:userId
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const history = await prisma.conversation.findMany({
        where: {
          user_id: userId,
          ai_doctor_id: 'visual_aura'
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      });

      res.status(200).json({ success: true, history });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

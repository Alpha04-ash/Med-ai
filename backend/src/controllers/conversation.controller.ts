import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { logEvent } from '../utils/logger';

export class ConversationController {
    static async getConversationsByUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId;
            const conversations = await prisma.conversation.findMany({
                where: { user_id: userId },
                orderBy: { timestamp: 'desc' }
            });
            res.status(200).json({ success: true, data: conversations });
        } catch (err: any) {
            logEvent('ConversationController', 'Failed to fetch conversations', { user_id: req.params.userId, error: err.message });
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

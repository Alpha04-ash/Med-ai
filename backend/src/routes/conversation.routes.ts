import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';

export const conversationRoutes = Router();

conversationRoutes.get('/:userId', ConversationController.getConversationsByUser);

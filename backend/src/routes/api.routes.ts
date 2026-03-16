import { Router } from 'express';
import { userRoutes } from './user.routes';
import { authRoutes } from './auth.routes';
import { conversationRoutes } from './conversation.routes';
import { reportRoutes } from './report.routes';
import { visualConsultRoutes } from './visual_consult.routes';

export const apiRoutes = Router();

apiRoutes.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/conversations', conversationRoutes);
apiRoutes.use('/reports', reportRoutes);
apiRoutes.use('/visual-consult', visualConsultRoutes);

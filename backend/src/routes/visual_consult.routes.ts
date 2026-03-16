import { Router } from 'express';
import { VisualConsultController } from '../controllers/visual_consult.controller';

export const visualConsultRoutes = Router();

// POST /api/v1/visual-consult/analyze
visualConsultRoutes.post('/analyze', VisualConsultController.analyze);

// GET /api/v1/visual-consult/history/:userId
visualConsultRoutes.get('/history/:userId', VisualConsultController.getHistory);

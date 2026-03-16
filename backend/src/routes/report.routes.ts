import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

export const reportRoutes = Router();

reportRoutes.get('/latest/:userId', ReportController.getLatestReport);
reportRoutes.post('/generate/:userId', ReportController.generateReport);

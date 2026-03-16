import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { ReportAgent } from '../agents/report_agent';
import { logEvent } from '../utils/logger';

export class ReportController {
    /** GET /api/v1/reports/latest/:userId — fetch most recent saved report */
    static async getLatestReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const report = await prisma.healthReport.findFirst({
                where: { user_id: userId },
                orderBy: { timestamp: 'desc' }
            });

            if (!report) {
                return res.status(404).json({ success: false, message: 'No report found. Please generate one first.' });
            }

            // Parse the JSON string back to object
            const parsedSuggestions = JSON.parse(report.suggestions as string);
            res.status(200).json({ success: true, data: { ...report, suggestions: parsedSuggestions } });
        } catch (err: any) {
            logEvent('ReportController', 'Failed to fetch latest report', { error: err.message });
            next(err);
        }
    }

    /** POST /api/v1/reports/generate/:userId — generate a fresh AI report */
    static async generateReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            // Fetch user profile + last 7 days of data
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const user = await prisma.userProfile.findUnique({
                where: { id: userId },
                include: {
                    vitals: { 
                        where: { timestamp: { gte: sevenDaysAgo } },
                        orderBy: { timestamp: 'desc' } 
                    },
                    conversations: {
                        where: { timestamp: { gte: sevenDaysAgo } },
                        orderBy: { timestamp: 'desc' }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Call AI Report Agent with full 7-day context
            const report = await ReportAgent.generate(user, user.vitals, user.conversations);

            // Save the structured JSON into HealthReport.suggestions (stored as string per schema)
            const savedReport = await prisma.healthReport.create({
                data: {
                    user_id: userId,
                    risk_score: report.risk_score,
                    classification: report.classification,
                    suggestions: JSON.stringify(report),
                }
            });

            res.status(201).json({ success: true, data: { ...savedReport, suggestions: report } });
        } catch (err: any) {
            logEvent('ReportController', 'Failed to generate report', { error: err.message });
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

import { prisma } from '../utils/db';
import { logEvent } from '../utils/logger';

export class UserService {
    static async createUser(data: any) {
        const user = await prisma.userProfile.create({ data });
        logEvent('UserService', 'User created', { user_id: user.id });
        return user;
    }

    static async getUserById(id: string) {
        const user = await prisma.userProfile.findUnique({
            where: { id },
            include: {
                vitals: { take: 5, orderBy: { timestamp: 'desc' } }, // Fetch latest 5 vitals
                reports: { take: 1, orderBy: { timestamp: 'desc' } } // Fetch latest report
            }
        });

        if (!user) throw new Error('User not found');
        return user;
    }

    static async exportData(id: string) {
        const user = await prisma.userProfile.findUnique({
            where: { id },
            include: {
                vitals: { orderBy: { timestamp: 'desc' } },
                reports: { orderBy: { timestamp: 'desc' } },
                conversations: { orderBy: { timestamp: 'desc' } }
            }
        });

        if (!user) throw new Error('User not found');
        logEvent('UserService', 'User data exported', { user_id: user.id });
        return user;
    }

    static async purgeData(id: string) {
        // Delete related telemetry data (Vitals, Reports, Conversations) but keep user profile
        await prisma.$transaction([
            prisma.vitalRecord.deleteMany({ where: { user_id: id } }),
            prisma.healthReport.deleteMany({ where: { user_id: id } }),
            prisma.conversation.deleteMany({ where: { user_id: id } })
        ]);
        logEvent('UserService', 'User telemetry purged', { user_id: id });
        return { success: true };
    }
}

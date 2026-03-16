import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { logEvent } from '../utils/logger';

export class UserController {
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json({ success: true, data: user });
        } catch (err: any) {
            logEvent('UserController', 'Failed to create user', { error: err.message });
            next(err);
        }
    }

    static async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.getUserById(req.params.id);
            res.status(200).json({ success: true, data: user });
        } catch (err: any) {
            logEvent('UserController', 'Failed to fetch user', { user_id: req.params.id, error: err.message });
            res.status(404).json({ success: false, message: err.message });
        }
    }

    static async exportData(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await UserService.exportData(req.params.id);
            res.status(200).json({ success: true, data });
        } catch (err: any) {
            logEvent('UserController', 'Failed to export user data', { user_id: req.params.id, error: err.message });
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async purgeData(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await UserService.purgeData(req.params.id);
            res.status(200).json(result);
        } catch (err: any) {
            logEvent('UserController', 'Failed to purge user data', { user_id: req.params.id, error: err.message });
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

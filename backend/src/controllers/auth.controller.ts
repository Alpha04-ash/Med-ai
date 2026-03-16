import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { logEvent } from '../utils/logger';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (err: any) {
            logEvent('AuthController', 'Registration failed', { error: err.message });
            res.status(400).json({ success: false, message: err.message });
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.login(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (err: any) {
            logEvent('AuthController', 'Login failed', { error: err.message });
            res.status(401).json({ success: false, message: err.message });
        }
    }
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';
import { env } from '../utils/env';

export class AuthService {
    static async register(data: any) {
        const { email, password, name, age, gender, weight, height, baseline_systolic, baseline_diastolic } = data;

        const existingUser = await prisma.userProfile.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.userProfile.create({
            data: {
                email,
                password_hash,
                name,
                age: Number(age),
                gender,
                weight: Number(weight),
                height: Number(height),
                baseline_systolic: Number(baseline_systolic || 120),
                baseline_diastolic: Number(baseline_diastolic || 80)
            }
        });

        const token = jwt.sign({ userId: user.id }, env.GEMINI_API_KEYS.split(';')[0] || 'secret', { expiresIn: '7d' });

        return { user, token };
    }

    static async login(data: any) {
        const { email, password } = data;

        const user = await prisma.userProfile.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({ userId: user.id }, env.GEMINI_API_KEYS.split(';')[0] || 'secret', { expiresIn: '7d' });

        return { user, token };
    }
}

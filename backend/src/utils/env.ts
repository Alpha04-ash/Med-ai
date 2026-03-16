import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('8080'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url(),
    GEMINI_API_KEYS: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    logger.error('Invalid environment variables', { errors: parsedEnv.error.format() });
    process.exit(1);
}

export const env = parsedEnv.data;

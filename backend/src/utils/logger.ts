import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp(),
        json()
    ),
    defaultMeta: { service: 'myhealth-api' },
    transports: [
        new winston.transports.Console()
    ],
});

/**
 * Structured log helper for agent/module specific logging
 */
export const logEvent = (
    module_name: string,
    message: string,
    meta?: { session_id?: string; user_id?: string;[key: string]: any }
) => {
    logger.info(message, { module_name, ...meta });
};

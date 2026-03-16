import { env } from './env';
import { logger } from './logger';

export class GeminiKeyManager {
    private static keys: string[] = env.GEMINI_API_KEYS.split(';').map(k => k.trim());
    private static currentIndex = 0;
    private static exhaustedKeys = new Set<string>();
    private static lastResetTime = Date.now();

    /**
     * Resets exhausted keys every hour to allow retries
     */
    private static checkReset() {
        const now = Date.now();
        if (now - this.lastResetTime > 3600000) { // 1 hour
            this.exhaustedKeys.clear();
            this.lastResetTime = now;
            logger.info('GeminiKeyManager: Resetting exhausted keys list');
        }
    }

    /**
     * Gets the next available API key using Round Robin logic.
     * Skips keys marked as exhausted.
     */
    static getNextKey(): string {
        this.checkReset();

        if (this.exhaustedKeys.size >= this.keys.length) {
            logger.error('GeminiKeyManager: CRITICAL - All API keys are currently exhausted');
            // Return a random one anyway as a last resort, maybe some quota was freed
            return this.keys[Math.floor(Math.random() * this.keys.length)];
        }

        let key: string;
        let attempts = 0;

        do {
            key = this.keys[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;
        } while (this.exhaustedKeys.has(key) && attempts < this.keys.length);

        return key;
    }

    /**
     * Marks a key as exhausted (e.g. hit 429 or 403 quota)
     */
    static markExhausted(key: string) {
        if (!this.exhaustedKeys.has(key)) {
            this.exhaustedKeys.add(key);
            logger.warn(`GeminiKeyManager: Key marked as EXHAUSTED (Total exhausted: ${this.exhaustedKeys.size}/${this.keys.length})`, { 
                keySnippet: key.substring(0, 10) + '...' 
            });
        }
    }

    /**
     * Returns all keys (for monitoring or setup)
     */
    static getAllKeys(): string[] {
        return this.keys;
    }
}

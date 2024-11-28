import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const limits = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry) {
    limits.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - entry.firstAttempt > WINDOW_MS) {
    limits.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    logger.warn('Rate limit exceeded', { key });
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits.entries()) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      limits.delete(key);
    }
  }
}, 60 * 60 * 1000);
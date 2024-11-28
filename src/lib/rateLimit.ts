interface RateLimitEntry {
  points: number;
  expires: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxPoints: number;
  private windowMs: number;

  constructor(maxPoints: number = 100, windowMs: number = 900000) { // 15 minutes default
    this.maxPoints = maxPoints;
    this.windowMs = windowMs;
  }

  async consume(key: string): Promise<boolean> {
    this.cleanup();
    
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, {
        points: this.maxPoints - 1,
        expires: now + this.windowMs,
      });
      return true;
    }

    if (entry.points <= 0) {
      return false;
    }

    entry.points--;
    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.expires <= now) {
        this.limits.delete(key);
      }
    }
  }
}

export const loginRateLimiter = new RateLimiter(
  Number(import.meta.env.VITE_RATE_LIMIT_MAX) || 100,
  Number(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 15 * 60 * 1000
);

export async function checkRateLimit(key: string) {
  return loginRateLimiter.consume(key);
}
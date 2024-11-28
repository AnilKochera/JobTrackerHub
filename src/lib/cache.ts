const CACHE_PREFIX = 'jobtrackr:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheOptions {
  ttl?: number;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!item) return null;

    const { value, expires } = JSON.parse(item);
    if (expires && expires < Date.now()) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return value as T;
  },

  async set(key: string, value: any, options: CacheOptions = {}) {
    const { ttl = DEFAULT_TTL } = options;
    const expires = Date.now() + ttl;

    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ value, expires })
    );
  },

  async delete(key: string) {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  async clear() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  },
};
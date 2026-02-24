/**
 * Industrial Frontend Cache Service
 *
 * Provides an in-memory + localStorage hybrid caching layer
 * to eliminate redundant network requests for static/predictable data.
 */

const MEMORY_CACHE = new Map();

export const cacheService = {
  /**
   * Get data from cache
   * @param {string} key - Unique identifier
   * @param {number} ttl - Time to live in milliseconds (default 5 mins)
   */
  get(key, ttl = 300000) {
    const entry = MEMORY_CACHE.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      MEMORY_CACHE.delete(key);
      return null;
    }

    return entry.data;
  },

  /**
   * Store data in cache
   * @param {string} key
   * @param {any} data
   */
  set(key, data) {
    MEMORY_CACHE.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Clear specific key or all
   */
  clear(key) {
    if (key) MEMORY_CACHE.delete(key);
    else MEMORY_CACHE.clear();
  },

  /**
   * Persistent storage wrapper (Sync) with TTL support
   */
  getPersistent(key, ttl = 604800000) {
    // Default 7 days
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry = JSON.parse(raw);
      if (!entry.data || !entry.timestamp) return null;

      const isExpired = Date.now() - entry.timestamp > ttl;
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  },

  setPersistent(key, data) {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn("Storage quota exceeded, skipping persistent cache", e);
    }
  },
};

/**
 * A simple in-memory cache with a Time-To-Live (TTL) mechanism.
 * This is suitable for single-instance deployments. For a distributed, multi-server
 * environment, a shared cache like Redis or Memcached would be required.
 */
class TtlCache {
  constructor(defaultTtl = 300000) {
    // Default TTL of 5 minutes
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  /**
   * Retrieves a value from the cache if it exists and has not expired.
   * @param {string} key The cache key.
   * @returns {any | null} The cached value or null if not found or expired.
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Stores a value in the cache with a TTL.
   * @param {string} key The cache key.
   * @param {any} value The value to store.
   */
  set(key, value) {
    const expiresAt = Date.now() + this.defaultTtl;
    this.cache.set(key, { value, expiresAt });
  }
}

export const secretsCache = new TtlCache();

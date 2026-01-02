import Redis from "ioredis";

class RedisService {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.onConnect();
    this.onError();
  }

  /* -------------------- Connection Handlers -------------------- */

  onConnect() {
    this.client.on("connect", () => {
      console.log("Redis Connected Successfully");
    });
  }

  onError() {
    this.client.on("error", (error) => {
      console.error("Redis Connection Error:", error);
    });
  }

  /* -------------------- Key-Value Operations -------------------- */

  async insertKeyInRedis(key, value, ttlInSeconds = null) {
    try {
      const data = JSON.stringify(value);

      if (ttlInSeconds) {
        await this.client.set(key, data, "EX", ttlInSeconds);
      } else {
        await this.client.set(key, data);
      }

      return true;
    } catch (error) {
      console.error("Redis Insert Error:", error);
      return false;
    }
  }

  async getKeyFromRedis(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis Get Error:", error);
      return null;
    }
  }

  async expireKey(key, ttlInSeconds) {
    try {
      await this.client.expire(key, ttlInSeconds);
      return true;
    } catch (error) {
      console.error("Redis Expire Error:", error);
      return false;
    }
  }

  /* -------------------- Hash Operations -------------------- */

  async insertKeyInRedisHash(hashName, key, value) {
    try {
      await this.client.hset(hashName, key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Redis Hash Insert Error:", error);
      return false;
    }
  }

  async getKeyFromRedisHash(hashName, key) {
    try {
      const data = await this.client.hget(hashName, key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis Hash Get Error:", error);
      return null;
    }
  }
}

export default new RedisService();

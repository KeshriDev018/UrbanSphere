import { createClient } from "redis";

let redisClient = null;

export const initializeRedis = async () => {
  try {
    redisClient = createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 2000);
          return delay;
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("disconnect", () => {
      console.log("⚠️ Redis disconnected");
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error("❌ Redis initialization failed:", err.message);
    // Don't throw error - allow app to continue without Redis (graceful degradation)
    return null;
  }
};

export const getRedisClient = () => {
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    console.log("Redis disconnected");
  }
};

import { createClient } from "redis";

let redisClient = null;

export const initializeRedis = async () => {
  try {
    const host = process.env.REDIS_HOST || "localhost";
    const port = parseInt(process.env.REDIS_PORT) || 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    console.log(`📍 Attempting Redis connection to ${host}:${port}`);

    redisClient = createClient({
      socket: {
        host: host,
        port: port,
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 2000);
          return delay;
        },
      },
      password: password,
    });

    redisClient.on("error", (err) => {
      console.error("⚠️ Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("disconnect", () => {
      console.log("⚠️ Redis disconnected");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis is ready");
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error("❌ Redis initialization failed:", err.message);
    console.warn("⚠️ App will continue without Redis caching");
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

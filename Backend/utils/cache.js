import { getRedisClient } from "../config/redis.config.js";

// Set data in cache with TTL (in seconds)
export const setCache = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping cache set");
      return false;
    }

    const serialized = JSON.stringify(value);
    await client.setEx(key, ttl, serialized);
    return true;
  } catch (err) {
    console.error(`❌ Cache set error for key ${key}:`, err.message);
    return false;
  }
};

// Get data from cache
export const getCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping cache get");
      return null;
    }

    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (err) {
    console.error(`❌ Cache get error for key ${key}:`, err.message);
    return null;
  }
};

// Delete single key from cache
export const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping cache delete");
      return false;
    }

    await client.del(key);
    return true;
  } catch (err) {
    console.error(`❌ Cache delete error for key ${key}:`, err.message);
    return false;
  }
};

// Delete multiple keys matching a pattern (e.g., "flats:*")
export const deleteCachePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping cache pattern delete");
      return false;
    }

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (err) {
    console.error(
      `❌ Cache pattern delete error for pattern ${pattern}:`,
      err.message,
    );
    return false;
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("⚠️ Redis not available, skipping cache clear");
      return false;
    }

    await client.flushDb();
    return true;
  } catch (err) {
    console.error("❌ Cache clear error:", err.message);
    return false;
  }
};

// Utility: Get or set cache in one call
export const cacheOrFetch = async (key, fetchFn, ttl = 3600) => {
  try {
    // Try to get from cache
    const cached = await getCache(key);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from source
    const data = await fetchFn();

    // Store in cache
    await setCache(key, data, ttl);

    return data;
  } catch (err) {
    console.error(`❌ Cache or fetch error for key ${key}:`, err.message);
    throw err;
  }
};

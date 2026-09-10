'use strict';

const { getRedisClient, isRedisReady } = require('../config/redis');
const logger = require('../utils/logger');

const memoryCache = new Map();

async function get(key) {
  if (!isRedisReady()) {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    if (cached.expiresAt && cached.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }

  try {
    const raw = await getRedisClient().get(key);
    if (raw == null) {
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    logger.warn({ err, key }, 'Redis get failed');
    return null;
  }
}

async function set(key, value, ttlSeconds) {
  if (!isRedisReady()) {
    memoryCache.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + Number(ttlSeconds) * 1000 : null,
    });
    return true;
  }

  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds) {
      await getRedisClient().set(key, payload, 'EX', Number(ttlSeconds));
    } else {
      await getRedisClient().set(key, payload);
    }
    return true;
  } catch (err) {
    logger.warn({ err, key }, 'Redis set failed');
    return false;
  }
}

async function del(key) {
  memoryCache.delete(key);
  if (!isRedisReady()) {
    return true;
  }

  try {
    await getRedisClient().del(key);
    return true;
  } catch (err) {
    logger.warn({ err, key }, 'Redis del failed');
    return false;
  }
}

module.exports = { get, set, del };

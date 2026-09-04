'use strict';

const { getRedisClient, isRedisReady } = require('../config/redis');
const logger = require('../utils/logger');

async function get(key) {
  if (!isRedisReady()) {
    return null;
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
    return false;
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
  if (!isRedisReady()) {
    return false;
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

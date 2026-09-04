'use strict';

const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5000,
  retryStrategy(times) {
    if (times > 8) {
      return null;
    }
    return Math.min(times * 200, 2000);
  },
};

function clientOptions() {
  const options = { ...redisConfig };
  if (!options.password) {
    delete options.password;
  }
  if (!options.username) {
    delete options.username;
  }
  return options;
}

let client;

function getRedisClient() {
  if (!client) {
    client = new Redis(clientOptions());
    client.on('error', (err) => {
      logger.warn({ err }, 'Redis connection error');
    });
  }
  return client;
}

async function connectRedis() {
  const redis = getRedisClient();
  try {
    if (redis.status === 'wait') {
      await redis.connect();
    } else {
      await redis.ping();
    }
    return redis.status === 'ready';
  } catch (err) {
    logger.warn({ err }, 'Redis tidak terhubung; cache dilewati');
    return false;
  }
}

function isRedisReady() {
  return Boolean(client && client.status === 'ready');
}

module.exports = {
  redisConfig,
  getRedisClient,
  connectRedis,
  isRedisReady,
};

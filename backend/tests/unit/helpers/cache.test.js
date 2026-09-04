'use strict';

jest.mock('../../../src/config/redis', () => ({
  getRedisClient: jest.fn(),
  isRedisReady: jest.fn(),
}));

jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
}));

const { getRedisClient, isRedisReady } = require('../../../src/config/redis');
const cache = require('../../../src/helpers/cache');

describe('cache helper', () => {
  let redis;

  beforeEach(() => {
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    getRedisClient.mockReturnValue(redis);
    isRedisReady.mockReturnValue(true);
  });

  it('returns null when Redis is not ready', async () => {
    isRedisReady.mockReturnValue(false);
    await expect(cache.get('dashboard:summary')).resolves.toBeNull();
    await expect(cache.set('dashboard:summary', { ok: true })).resolves.toBe(false);
    await expect(cache.del('dashboard:summary')).resolves.toBe(false);
    expect(redis.get).not.toHaveBeenCalled();
  });

  it('parses JSON values from Redis', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ total: 3 }));
    await expect(cache.get('k')).resolves.toEqual({ total: 3 });
  });

  it('stores JSON with optional TTL', async () => {
    redis.set.mockResolvedValue('OK');
    await expect(cache.set('k', { total: 3 }, 60)).resolves.toBe(true);
    expect(redis.set).toHaveBeenCalledWith('k', '{"total":3}', 'EX', 60);
  });

  it('stores JSON without TTL', async () => {
    redis.set.mockResolvedValue('OK');
    await expect(cache.set('k', { total: 3 })).resolves.toBe(true);
    expect(redis.set).toHaveBeenCalledWith('k', '{"total":3}');
  });

  it('deletes a key', async () => {
    redis.del.mockResolvedValue(1);
    await expect(cache.del('k')).resolves.toBe(true);
    expect(redis.del).toHaveBeenCalledWith('k');
  });

  it('swallows Redis errors', async () => {
    redis.get.mockRejectedValue(new Error('down'));
    redis.set.mockRejectedValue(new Error('down'));
    redis.del.mockRejectedValue(new Error('down'));
    await expect(cache.get('k')).resolves.toBeNull();
    await expect(cache.set('k', 1)).resolves.toBe(false);
    await expect(cache.del('k')).resolves.toBe(false);
  });
});

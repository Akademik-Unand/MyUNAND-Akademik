'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/v1/auth/login', () => {
  it('returns 422 when body is invalid', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(422);
    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe(422);
    expect(Array.isArray(res.body.error)).toBe(true);
  });
});

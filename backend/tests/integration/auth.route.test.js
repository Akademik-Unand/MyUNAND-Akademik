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

describe('POST /api/v1/auth/refresh', () => {
  it('returns 422 when body is invalid', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(422);
  });
});

describe('PUT /api/v1/auth/profile', () => {
  it('rejects request without token', async () => {
    const res = await request(app).put('/api/v1/auth/profile').send({ name: 'Admin' });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/v1/auth/change-password', () => {
  it('rejects request without token', async () => {
    const res = await request(app)
      .put('/api/v1/auth/change-password')
      .send({ current_password: 'x', new_password: '12345678' });
    expect(res.status).toBe(401);
  });
});

'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/dashboard/summary', () => {
  it('rejects request without token', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });
});

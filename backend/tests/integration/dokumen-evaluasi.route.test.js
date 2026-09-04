'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/dokumen-evaluasi', () => {
  it('rejects request without token', async () => {
    const res = await request(app).get('/api/v1/dokumen-evaluasi');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });
});

describe('GET /api/v1/jenis-dokumen-evaluasi', () => {
  it('rejects request without token', async () => {
    const res = await request(app).get('/api/v1/jenis-dokumen-evaluasi');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });
});

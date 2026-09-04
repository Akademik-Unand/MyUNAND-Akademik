'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/fakultas', () => {
  it('rejects request without token', async () => {
    const res = await request(app).get('/api/v1/fakultas');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('rejects create without token', async () => {
    const res = await request(app)
      .post('/api/v1/fakultas')
      .send({ kode_fakultas: 'F01', nama_resmi: 'Fakultas Tes' });
    expect(res.status).toBe(401);
  });
});

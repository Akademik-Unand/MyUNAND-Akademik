'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('IAM guards', () => {
  it('rejects GET /auth/me without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects GET /roles/matrix without token', async () => {
    const res = await request(app).get('/api/v1/roles/matrix');
    expect(res.status).toBe(401);
  });

  it('rejects PUT user roles without token', async () => {
    const res = await request(app)
      .put('/api/v1/users/00000000-0000-4000-8000-000000000001/roles')
      .send({ role_ids: [] });
    expect(res.status).toBe(401);
  });

  it('rejects GET /activity-logs without token', async () => {
    const res = await request(app).get('/api/v1/activity-logs');
    expect(res.status).toBe(401);
  });

  it('rejects PUT role permissions without token', async () => {
    const res = await request(app)
      .put('/api/v1/roles/00000000-0000-4000-8000-000000000001/permissions')
      .send({ permission_ids: [] });
    expect(res.status).toBe(401);
  });
});

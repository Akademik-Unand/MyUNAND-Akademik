'use strict';

const request = require('supertest');
const app = require('../../src/app');

const PRODI_ID = '11111111-1111-1111-1111-111111111111';

describe('PATCH /api/v1/program-studi/:id/sks', () => {
  it('rejects request without token', async () => {
    const res = await request(app)
      .patch(`/api/v1/program-studi/${PRODI_ID}/sks`)
      .send({ sks_default: 18, sks_maksimal: 24 });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('tidak mengarahkan endpoint kuota SKS ke route lain (bukan 404)', async () => {
    const res = await request(app)
      .patch(`/api/v1/program-studi/${PRODI_ID}/sks`)
      .send({ sks_default: 18, sks_maksimal: 24 });

    expect(res.status).not.toBe(404);
  });

  it('rejects update profil prodi tanpa token', async () => {
    const res = await request(app)
      .put(`/api/v1/program-studi/${PRODI_ID}`)
      .send({ nama_resmi: 'Prodi Tes' });

    expect(res.status).toBe(401);
  });
});

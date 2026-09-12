'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(
  ['tahun_akademik', 'status', 'createdAt'],
  [
    'dosen_id',
    'mahasiswa_id',
    'status',
    'tahun_akademik',
    'program_studi_id',
    'departemen_id',
    'fakultas_id',
  ]
);

/** Daftar mahasiswa yang belum punya dosen PA aktif (calon bimbingan). */
const candidates = listQuery(
  ['nama', 'niu', 'angkatan', 'createdAt'],
  ['program_studi_id', 'departemen_id', 'fakultas_id', 'angkatan']
);

/** Daftar mahasiswa bimbingan milik dosen yang login. */
const saya = listQuery(['createdAt', 'tahun_akademik'], ['tahun_akademik', 'mahasiswa_id']);

const summaryQuery = listQuery();

const assignBulk = Joi.object({
  dosen_id: Joi.string().uuid().required(),
  mahasiswa_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  tahun_akademik: Joi.string().max(10).allow(null, ''),
  catatan: Joi.string().allow(null, ''),
});

const create = Joi.object({
  dosen_id: Joi.string().uuid().required(),
  mahasiswa_id: Joi.string().uuid().required(),
  tahun_akademik: Joi.string().max(10).allow(null, ''),
  status: Joi.string().valid('aktif', 'selesai').allow(null),
  catatan: Joi.string().allow(null, ''),
});

const update = Joi.object({
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
  tahun_akademik: Joi.string().max(10).allow(null, ''),
  status: Joi.string().valid('aktif', 'selesai').allow(null),
  catatan: Joi.string().allow(null, ''),
});

module.exports = { list, saya, candidates, summaryQuery, assignBulk, create, update, idParam };

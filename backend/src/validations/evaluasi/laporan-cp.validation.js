'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const item = Joi.object({
  cpmk_id: Joi.string().uuid().required(),
  matakuliah_id: Joi.string().uuid().required(),
  semester_id: Joi.string().uuid().allow(null),
});

const list = listQuery(['createdAt', 'nama_laporan'], ['program_studi_id', 'kurikulum_id', 'semester_id']);

const preview = Joi.object({
  kurikulum_id: Joi.string().uuid().required(),
  semester_id: Joi.string().uuid().allow('', null),
});

const matakuliahParam = Joi.object({
  matakuliahId: Joi.string().uuid().required(),
});

const matakuliahQuery = Joi.object({
  semester_id: Joi.string().uuid().allow('', null),
  kurikulum_id: Joi.string().uuid().allow('', null),
});

const create = Joi.object({
  program_studi_id: Joi.string().uuid().allow(null),
  kurikulum_id: Joi.string().uuid().required(),
  semester_id: Joi.string().uuid().allow(null, ''),
  nama_laporan: Joi.string().max(255).required(),
  keterangan: Joi.string().allow(null, ''),
  file_path: Joi.string().max(255).allow(null, ''),
  dibuat_oleh: Joi.string().uuid().allow(null),
  items: Joi.array().items(item).default([]),
});

const update = Joi.object({
  program_studi_id: Joi.string().uuid().allow(null),
  kurikulum_id: Joi.string().uuid(),
  semester_id: Joi.string().uuid().allow(null, ''),
  nama_laporan: Joi.string().max(255),
  keterangan: Joi.string().allow(null, ''),
  file_path: Joi.string().max(255).allow(null, ''),
  dibuat_oleh: Joi.string().uuid().allow(null),
  items: Joi.array().items(item),
});

module.exports = { list, preview, create, update, idParam, matakuliahParam, matakuliahQuery };

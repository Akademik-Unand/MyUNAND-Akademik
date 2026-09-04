'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(
  ['nama', 'createdAt'],
  ['jenis_dokumen_evaluasi_id', 'kelas_id', 'matakuliah_id', 'semester_id', 'user_id']
);
const create = Joi.object({
  nama: Joi.string().max(255).required(),
  jenis_dokumen_evaluasi_id: Joi.string().uuid().allow(null),
  kelas_id: Joi.string().uuid().allow(null),
  matakuliah_id: Joi.string().uuid().allow(null),
  semester_id: Joi.string().uuid().allow(null),
  file_path: Joi.string().max(255).allow(null, ''),
  user_id: Joi.string().uuid().allow(null),
  keterangan: Joi.string().allow(null, ''),
});
const update = Joi.object({
  nama: Joi.string().max(255).allow(null),
  jenis_dokumen_evaluasi_id: Joi.string().uuid().allow(null),
  kelas_id: Joi.string().uuid().allow(null),
  matakuliah_id: Joi.string().uuid().allow(null),
  semester_id: Joi.string().uuid().allow(null),
  file_path: Joi.string().max(255).allow(null, ''),
  user_id: Joi.string().uuid().allow(null),
  keterangan: Joi.string().allow(null, ''),
});

module.exports = { list, create, update, idParam };

'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(['nilai', 'createdAt'], ['krs_detil_id', 'sumber_penilaian_id']);

const create = Joi.object({
  krs_detil_id: Joi.string().uuid().required(),
  sumber_penilaian_id: Joi.string().uuid().required(),
  nilai: Joi.number().allow(null),
  catatan: Joi.string().allow(null, ''),
});

const update = Joi.object({
  krs_detil_id: Joi.string().uuid().allow(null),
  sumber_penilaian_id: Joi.string().uuid().allow(null),
  nilai: Joi.number().allow(null),
  catatan: Joi.string().allow(null, ''),
});

const upload = Joi.object({
  kelas_id: Joi.string().uuid().allow(null),
  keterangan: Joi.string().allow(null, ''),
  file_name: Joi.string().max(255).allow(null, ''),
  items: Joi.array().items(Joi.object({
    krs_detil_id: Joi.string().uuid().required(),
    sumber_penilaian_id: Joi.string().uuid().required(),
    nilai: Joi.number().allow(null),
    catatan: Joi.string().allow(null, ''),
  })).min(1).required(),
});

module.exports = { list, create, update, idParam, upload };

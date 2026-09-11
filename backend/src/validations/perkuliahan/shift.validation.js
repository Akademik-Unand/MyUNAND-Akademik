'use strict';
const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(['kode', 'jam_mulai', 'jam_selesai', 'createdAt'], ['fakultas_id']);
const create = Joi.object({
  fakultas_id: Joi.string().uuid().required(),
  kode: Joi.string().max(50).required(),
  jam_mulai: Joi.string().required(),
  jam_selesai: Joi.string().required(),
});
const update = Joi.object({
  fakultas_id: Joi.string().uuid().allow(null),
  kode: Joi.string().max(50).allow(null),
  jam_mulai: Joi.string().allow(null),
  jam_selesai: Joi.string().allow(null),
}).min(1);

module.exports = { list, create, update, idParam };
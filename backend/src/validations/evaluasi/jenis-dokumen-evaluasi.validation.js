'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(['nama', 'tipe', 'createdAt'], ['tipe']);
const create = Joi.object({
  nama: Joi.string().max(255).required(),
  tipe: Joi.string().max(50).allow(null, ''),
  keterangan: Joi.string().allow(null, ''),
});
const update = Joi.object({
  nama: Joi.string().max(255).allow(null),
  tipe: Joi.string().max(50).allow(null, ''),
  keterangan: Joi.string().allow(null, ''),
});

module.exports = { list, create, update, idParam };

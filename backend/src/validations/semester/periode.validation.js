'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const JENIS = ['cpmk', 'nilai'];

const list = listQuery(
  ['jenis', 'tanggal_mulai', 'tanggal_selesai', 'createdAt'],
  ['semester_id', 'jenis']
);

const create = Joi.object({
  semester_id: Joi.string().uuid().required(),
  jenis: Joi.string().valid(...JENIS).required(),
  tanggal_mulai: Joi.date().required(),
  tanggal_selesai: Joi.date().min(Joi.ref('tanggal_mulai')).required(),
});

const update = Joi.object({
  semester_id: Joi.string().uuid(),
  jenis: Joi.string().valid(...JENIS),
  tanggal_mulai: Joi.date(),
  tanggal_selesai: Joi.date(),
}).custom((value, helpers) => {
  if (value.tanggal_mulai && value.tanggal_selesai && value.tanggal_selesai < value.tanggal_mulai) {
    return helpers.error('any.invalid', { message: 'tanggal_selesai harus pada atau setelah tanggal_mulai' });
  }
  return value;
});

module.exports = { list, create, update, idParam, JENIS };

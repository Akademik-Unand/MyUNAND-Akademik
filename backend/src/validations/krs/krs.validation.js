'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(['approval_ke', 'createdAt'], ['mahasiswa_id', 'semester_prodi_id']);

const create = Joi.object({
  mahasiswa_id: Joi.string().uuid().required(),
  semester_prodi_id: Joi.string().uuid().required(),
  jam_mulai: Joi.date().allow(null),
  jam_selesai: Joi.date().allow(null),
  approval_ke: Joi.number().allow(null),
});

const update = Joi.object({
  mahasiswa_id: Joi.string().uuid().allow(null),
  semester_prodi_id: Joi.string().uuid().allow(null),
  jam_mulai: Joi.date().allow(null),
  jam_selesai: Joi.date().allow(null),
  approval_ke: Joi.number().allow(null),
});

const approve = Joi.object({
  approval_ke: Joi.number().integer().min(0),
});

const detilStatus = Joi.object({
  approved: Joi.string().valid('0', '1', '2').required(),
});

const detilIdParam = Joi.object({
  detilId: Joi.string().uuid().required(),
});

const mahasiswaIdParam = Joi.object({
  mahasiswaId: Joi.string().uuid().required(),
});

module.exports = { list, create, update, idParam, approve, detilStatus, detilIdParam, mahasiswaIdParam };

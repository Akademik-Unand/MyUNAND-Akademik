'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const downloadQuery = Joi.object({}).unknown(false);
// `attachAbility` dapat menyuntikkan filter organisasi untuk akun multi-role;
// endpoint tetap mengabaikannya dan memakai relasi PA aktif sebagai scope.
const approvalSemestersQuery = listQuery([], []);

const list = listQuery(['approval_ke', 'createdAt'], ['mahasiswa_id', 'semester_id']);

const create = Joi.object({
  mahasiswa_id: Joi.string().uuid().required(),
  semester_id: Joi.string().uuid().required(),
  jam_mulai: Joi.date().allow(null),
  jam_selesai: Joi.date().allow(null),
  approval_ke: Joi.number().allow(null),
});

const update = Joi.object({
  mahasiswa_id: Joi.string().uuid().allow(null),
  semester_id: Joi.string().uuid().allow(null),
  jam_mulai: Joi.date().allow(null),
  jam_selesai: Joi.date().allow(null),
  approval_ke: Joi.number().allow(null),
});

const approve = Joi.object({
  approval_ke: Joi.number().integer().min(0),
  semester_id: Joi.string().uuid().required(),
});

const reject = Joi.object({
  reason: Joi.string().trim().min(3).max(1000).required(),
  semester_id: Joi.string().uuid().required(),
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

module.exports = {
  downloadQuery,
  approvalSemestersQuery,
  list,
  create,
  update,
  idParam,
  approve,
  reject,
  detilStatus,
  detilIdParam,
  mahasiswaIdParam,
};

'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(['name', 'email', 'role', 'createdAt'], ['email', 'role']);

const create = Joi.object({
  name: Joi.string().max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
});

const update = Joi.object({
  name: Joi.string().max(255).allow(null),
  email: Joi.string().email().allow(null),
  password: Joi.string().min(6).allow(null, ''),
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
});

const assignRoles = Joi.object({
  role_ids: Joi.array().items(Joi.string().uuid()).required(),
});

const unitItem = Joi.object({
  fakultas_id: Joi.string().uuid().allow(null),
  departemen_id: Joi.string().uuid().allow(null),
  program_studi_id: Joi.string().uuid().allow(null),
}).custom((value, helpers) => {
  const selected = [value.fakultas_id, value.departemen_id, value.program_studi_id].filter(Boolean);
  if (selected.length !== 1) {
    return helpers.message('Setiap unit wajib memilih tepat satu level (fakultas/departemen/prodi)');
  }
  return value;
});

const assignUnits = Joi.object({
  units: Joi.array().items(unitItem).max(50).default([]),
});

module.exports = { list, create, update, idParam, assignRoles, assignUnits };

'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(['name', 'email', 'role', 'createdAt'], ['email', 'role']);

const create = Joi.object({
  name: Joi.string().max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('superadmin', 'admin', 'dosen', 'mahasiswa'),
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
});

const update = Joi.object({
  name: Joi.string().max(255).allow(null),
  email: Joi.string().email().allow(null),
  password: Joi.string().min(6).allow(null, ''),
  role: Joi.string().valid('superadmin', 'admin', 'dosen', 'mahasiswa').allow(null),
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
});

const assignRoles = Joi.object({
  role_ids: Joi.array().items(Joi.string().uuid()).required(),
});

module.exports = { list, create, update, idParam, assignRoles };

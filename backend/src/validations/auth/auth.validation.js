'use strict';

const Joi = require('joi');

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = Joi.object({
  name: Joi.string().max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('superadmin', 'admin', 'dosen', 'mahasiswa'),
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
});

module.exports = { login, register };

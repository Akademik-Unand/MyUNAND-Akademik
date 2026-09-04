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
  role: Joi.string().max(64),
  dosen_id: Joi.string().uuid().allow(null),
  mahasiswa_id: Joi.string().uuid().allow(null),
});

const updateProfile = Joi.object({
  name: Joi.string().max(255).required(),
});

const changePassword = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
});

module.exports = { login, register, updateProfile, changePassword };

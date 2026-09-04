'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["name","createdAt"], ["name","guard_name"]);
const create = Joi.object({
    name: Joi.string().max(255).required(),
    guard_name: Joi.string().max(255).allow(null),
});
const update = Joi.object({
    name: Joi.string().max(255).allow(null),
    guard_name: Joi.string().max(255).allow(null),
});

const syncPermissions = Joi.object({
  permission_ids: Joi.array().items(Joi.string().uuid()).required(),
});

module.exports = { list, create, update, idParam, syncPermissions };

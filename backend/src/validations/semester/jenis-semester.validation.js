'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama","alias","createdAt"], ["nama","alias"]);
const create = Joi.object({
    nama: Joi.string().max(50).required(),
    alias: Joi.string().max(10).allow(null),
    urut: Joi.number().allow(null),
});
const update = Joi.object({
    nama: Joi.string().max(50).allow(null),
    alias: Joi.string().max(10).allow(null),
    urut: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

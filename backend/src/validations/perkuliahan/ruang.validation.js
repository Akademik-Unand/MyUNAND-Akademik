'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["kode","nama","createdAt"], ["kode"]);
const create = Joi.object({
    kode: Joi.string().max(50).required(),
    nama: Joi.string().max(255).required(),
    kapasitas: Joi.number().allow(null),
});
const update = Joi.object({
    kode: Joi.string().max(50).allow(null),
    nama: Joi.string().max(255).allow(null),
    kapasitas: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

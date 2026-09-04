'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["kode_jenjang","nama_jenjang","createdAt"], ["kode_jenjang"]);
const create = Joi.object({
    kode_jenjang: Joi.string().max(10).required(),
    nama_jenjang: Joi.string().max(255).allow(null),
});
const update = Joi.object({
    kode_jenjang: Joi.string().max(10).allow(null),
    nama_jenjang: Joi.string().max(255).allow(null),
});

module.exports = { list, create, update, idParam };

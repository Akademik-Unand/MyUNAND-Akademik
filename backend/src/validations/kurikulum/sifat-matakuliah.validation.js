'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama","kode_sifat_matakuliah","createdAt"], ["kode_sifat_matakuliah"]);
const create = Joi.object({
    kode_sifat_matakuliah: Joi.string().max(1).required(),
    nama: Joi.string().max(255).required(),
});
const update = Joi.object({
    kode_sifat_matakuliah: Joi.string().max(1).allow(null),
    nama: Joi.string().max(255).allow(null),
});

module.exports = { list, create, update, idParam };

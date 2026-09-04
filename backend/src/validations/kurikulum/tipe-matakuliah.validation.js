'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama","kode_tipe_matakuliah","createdAt"], ["kode_tipe_matakuliah"]);
const create = Joi.object({
    kode_tipe_matakuliah: Joi.string().max(10).required(),
    nama: Joi.string().max(255).required(),
    is_dipakai: Joi.number().allow(null),
});
const update = Joi.object({
    kode_tipe_matakuliah: Joi.string().max(10).allow(null),
    nama: Joi.string().max(255).allow(null),
    is_dipakai: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

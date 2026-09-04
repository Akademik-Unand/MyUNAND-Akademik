'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama_cpmk","createdAt"], ["matakuliah_id"]);
const create = Joi.object({
    matakuliah_id: Joi.string().uuid().required(),
    nama_cpmk: Joi.string().max(255).required(),
    deskripsi: Joi.string().allow(null),
});
const update = Joi.object({
    matakuliah_id: Joi.string().uuid().allow(null),
    nama_cpmk: Joi.string().max(255).allow(null),
    deskripsi: Joi.string().allow(null),
});

module.exports = { list, create, update, idParam };

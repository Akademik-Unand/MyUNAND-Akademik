'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["kode_universitas","nama_resmi","nama_singkat","createdAt"], ["kode_universitas"]);
const create = Joi.object({
    kode_universitas: Joi.string().max(15).required(),
    nama_resmi: Joi.string().max(255).required(),
    nama_singkat: Joi.string().max(50).allow(null),
});
const update = Joi.object({
    kode_universitas: Joi.string().max(15).allow(null),
    nama_resmi: Joi.string().max(255).allow(null),
    nama_singkat: Joi.string().max(50).allow(null),
});

module.exports = { list, create, update, idParam };

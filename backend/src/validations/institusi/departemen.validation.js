'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["kode_departemen","nama_resmi","nama_singkat","createdAt"], ["kode_departemen","fakultas_id","universitas_id"]);
const create = Joi.object({
    kode_departemen: Joi.string().max(15).required(),
    universitas_id: Joi.string().uuid().allow(null),
    fakultas_id: Joi.string().uuid().required(),
    nama_resmi: Joi.string().max(255).required(),
    nama_singkat: Joi.string().max(255).allow(null),
});
const update = Joi.object({
    kode_departemen: Joi.string().max(15).allow(null),
    universitas_id: Joi.string().uuid().allow(null),
    fakultas_id: Joi.string().uuid().allow(null),
    nama_resmi: Joi.string().max(255).allow(null),
    nama_singkat: Joi.string().max(255).allow(null),
});

module.exports = { list, create, update, idParam };

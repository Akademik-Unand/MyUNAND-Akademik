'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["kode_prodi","nama_resmi","nama_singkat","createdAt"], ["kode_prodi","jenjang_akademik_id","fakultas_id","departemen_id"]);
const create = Joi.object({
    kode_prodi: Joi.string().max(15).required(),
    jenjang_akademik_id: Joi.string().uuid().allow(null),
    model_kurikulum_id: Joi.string().uuid().allow(null),
    universitas_id: Joi.string().uuid().allow(null),
    fakultas_id: Joi.string().uuid().required(),
    departemen_id: Joi.string().uuid().allow(null),
    nama_resmi: Joi.string().max(255).required(),
    nama_singkat: Joi.string().max(255).allow(null),
});
const update = Joi.object({
    kode_prodi: Joi.string().max(15).allow(null),
    jenjang_akademik_id: Joi.string().uuid().allow(null),
    model_kurikulum_id: Joi.string().uuid().allow(null),
    universitas_id: Joi.string().uuid().allow(null),
    fakultas_id: Joi.string().uuid().allow(null),
    departemen_id: Joi.string().uuid().allow(null),
    nama_resmi: Joi.string().max(255).allow(null),
    nama_singkat: Joi.string().max(255).allow(null),
});

module.exports = { list, create, update, idParam };

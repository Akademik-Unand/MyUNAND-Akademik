'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama_scp","createdAt"], ["cp_id"]);
const create = Joi.object({
    cp_id: Joi.string().uuid().required(),
    nama_scp: Joi.string().max(255).required(),
    deskripsi: Joi.string().allow(null),
    persen_capai_nilai_min: Joi.number().allow(null),
    nilai_min: Joi.number().allow(null),
});
const update = Joi.object({
    cp_id: Joi.string().uuid().allow(null),
    nama_scp: Joi.string().max(255).allow(null),
    deskripsi: Joi.string().allow(null),
    persen_capai_nilai_min: Joi.number().allow(null),
    nilai_min: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

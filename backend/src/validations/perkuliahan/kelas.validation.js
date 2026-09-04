'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama","createdAt"], ["matakuliah_id","semester_prodi_id"]);
const create = Joi.object({
    semester_prodi_id: Joi.string().uuid().allow(null),
    matakuliah_id: Joi.string().uuid().required(),
    nama: Joi.string().max(10).required(),
    jumlah_peserta_min: Joi.number().allow(null),
    jumlah_peserta_max: Joi.number().allow(null),
});
const update = Joi.object({
    semester_prodi_id: Joi.string().uuid().allow(null),
    matakuliah_id: Joi.string().uuid().allow(null),
    nama: Joi.string().max(10).allow(null),
    jumlah_peserta_min: Joi.number().allow(null),
    jumlah_peserta_max: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

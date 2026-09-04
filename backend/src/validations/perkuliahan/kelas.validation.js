'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const list = listQuery(["nama","createdAt"], uniqueFields(["matakuliah_id","semester_prodi_id"], ORG_FILTER_FIELDS));
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

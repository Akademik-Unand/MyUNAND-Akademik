'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const list = listQuery(["createdAt"], uniqueFields(["mahasiswa_id","cp_id","semester_prodi_id"], ORG_FILTER_FIELDS));
const create = Joi.object({
    mahasiswa_id: Joi.string().uuid().required(),
    cp_id: Joi.string().uuid().required(),
    semester_prodi_id: Joi.string().uuid().allow(null),
    nilai_capaian: Joi.number().allow(null),
    status_lulus: Joi.boolean().allow(null),
});
const update = Joi.object({
    mahasiswa_id: Joi.string().uuid().allow(null),
    cp_id: Joi.string().uuid().allow(null),
    semester_prodi_id: Joi.string().uuid().allow(null),
    nilai_capaian: Joi.number().allow(null),
    status_lulus: Joi.boolean().allow(null),
});

module.exports = { list, create, update, idParam };

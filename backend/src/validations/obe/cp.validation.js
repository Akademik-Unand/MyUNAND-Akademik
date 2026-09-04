'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const list = listQuery(["nama_cp","createdAt"], uniqueFields(["kurikulum_id"], ORG_FILTER_FIELDS));
const create = Joi.object({
    kurikulum_id: Joi.string().uuid().required(),
    nama_cp: Joi.string().max(255).required(),
    deskripsi: Joi.string().allow(null),
    nilai_max: Joi.number().allow(null),
    nilai_min: Joi.number().allow(null),
});
const update = Joi.object({
    kurikulum_id: Joi.string().uuid().allow(null),
    nama_cp: Joi.string().max(255).allow(null),
    deskripsi: Joi.string().allow(null),
    nilai_max: Joi.number().allow(null),
    nilai_min: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

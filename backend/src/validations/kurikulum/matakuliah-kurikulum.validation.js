'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const list = listQuery(["status","createdAt"], uniqueFields(["kurikulum_id","matakuliah_id","status"], ORG_FILTER_FIELDS));
const create = Joi.object({
    kurikulum_id: Joi.string().uuid().required(),
    matakuliah_id: Joi.string().uuid().required(),
    status: Joi.string().max(10).allow(null),
});
const update = Joi.object({
    kurikulum_id: Joi.string().uuid().allow(null),
    matakuliah_id: Joi.string().uuid().allow(null),
    status: Joi.string().max(10).allow(null),
});

module.exports = { list, create, update, idParam };

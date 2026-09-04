'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["approved","createdAt"], ["krs_id","kelas_id","approved"]);
const create = Joi.object({
    krs_id: Joi.string().uuid().required(),
    kelas_id: Joi.string().uuid().required(),
    approved: Joi.string().valid('0', '1', '2').allow(null),
});
const update = Joi.object({
    krs_id: Joi.string().uuid().allow(null),
    kelas_id: Joi.string().uuid().allow(null),
    approved: Joi.string().valid('0', '1', '2').allow(null),
});

module.exports = { list, create, update, idParam };

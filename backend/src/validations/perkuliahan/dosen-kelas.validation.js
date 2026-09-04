'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["dosen_ke","createdAt"], ["dosen_id","kelas_id"]);
const create = Joi.object({
    dosen_id: Joi.string().uuid().required(),
    kelas_id: Joi.string().uuid().required(),
    dosen_ke: Joi.number().allow(null),
});
const update = Joi.object({
    dosen_id: Joi.string().uuid().allow(null),
    kelas_id: Joi.string().uuid().allow(null),
    dosen_ke: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

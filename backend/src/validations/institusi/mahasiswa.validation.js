'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["niu","nama","angkatan","createdAt"], ["niu","program_studi_id","angkatan"]);
const create = Joi.object({
    niu: Joi.string().max(20).required(),
    nama: Joi.string().max(255).required(),
    angkatan: Joi.number().allow(null),
    program_studi_id: Joi.string().uuid().allow(null),
    jenis_kelamin: Joi.string().valid('L', 'P').allow(null),
});
const update = Joi.object({
    niu: Joi.string().max(20).allow(null),
    nama: Joi.string().max(255).allow(null),
    angkatan: Joi.number().allow(null),
    program_studi_id: Joi.string().uuid().allow(null),
    jenis_kelamin: Joi.string().valid('L', 'P').allow(null),
});

module.exports = { list, create, update, idParam };

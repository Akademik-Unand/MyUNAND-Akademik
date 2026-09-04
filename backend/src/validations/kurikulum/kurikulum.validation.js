'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama","tahun","masa_studi_ideal","masa_studi_maksimal","createdAt"], ["program_studi_id","tahun"]);
const create = Joi.object({
    program_studi_id: Joi.string().uuid().required(),
    tahun: Joi.number().allow(null),
    nama: Joi.string().max(255).allow(null),
    masa_studi_ideal: Joi.number().allow(null),
    masa_studi_maksimal: Joi.number().allow(null),
});
const update = Joi.object({
    program_studi_id: Joi.string().uuid().allow(null),
    tahun: Joi.number().allow(null),
    nama: Joi.string().max(255).allow(null),
    masa_studi_ideal: Joi.number().allow(null),
    masa_studi_maksimal: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

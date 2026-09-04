'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nip","nama","nidn","createdAt"], ["nip","program_studi_id"]);
const create = Joi.object({
    nip: Joi.string().max(18).required(),
    program_studi_id: Joi.string().uuid().allow(null),
    nama: Joi.string().max(255).allow(null),
    nidn: Joi.string().max(10).allow(null),
    nip_lama: Joi.string().max(20).allow(null),
    nip_baru: Joi.string().max(20).allow(null),
});
const update = Joi.object({
    nip: Joi.string().max(18).allow(null),
    program_studi_id: Joi.string().uuid().allow(null),
    nama: Joi.string().max(255).allow(null),
    nidn: Joi.string().max(10).allow(null),
    nip_lama: Joi.string().max(20).allow(null),
    nip_baru: Joi.string().max(20).allow(null),
});

module.exports = { list, create, update, idParam };

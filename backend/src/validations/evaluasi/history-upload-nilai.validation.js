'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["createdAt"], ["kelas_id","user_id"]);
const create = Joi.object({
    kelas_id: Joi.string().uuid().required(),
    user_id: Joi.string().uuid().allow(null),
    tipe: Joi.string().max(50).allow(null),
    file_name: Joi.string().max(255).required(),
    keterangan: Joi.string().allow(null),
});
const update = Joi.object({
    kelas_id: Joi.string().uuid().allow(null),
    user_id: Joi.string().uuid().allow(null),
    tipe: Joi.string().max(50).allow(null),
    file_name: Joi.string().max(255).allow(null),
    keterangan: Joi.string().allow(null),
});

module.exports = { list, create, update, idParam };

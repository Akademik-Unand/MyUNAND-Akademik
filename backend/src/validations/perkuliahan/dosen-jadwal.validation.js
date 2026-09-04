'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["createdAt"], ["dosen_kelas_id","jadwal_kelas_id"]);
const create = Joi.object({
    dosen_kelas_id: Joi.string().uuid().required(),
    jadwal_kelas_id: Joi.string().uuid().required(),
});
const update = Joi.object({
    dosen_kelas_id: Joi.string().uuid().allow(null),
    jadwal_kelas_id: Joi.string().uuid().allow(null),
});

module.exports = { list, create, update, idParam };

'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["tahun","createdAt"], ["jenis_semester_id","tahun"]);
const create = Joi.object({
    jenis_semester_id: Joi.string().uuid().required(),
    tahun: Joi.number().required(),
    tanggal_mulai: Joi.date().allow(null),
    tanggal_selesai: Joi.date().allow(null),
});
const update = Joi.object({
    jenis_semester_id: Joi.string().uuid().allow(null),
    tahun: Joi.number().allow(null),
    tanggal_mulai: Joi.date().allow(null),
    tanggal_selesai: Joi.date().allow(null),
});

module.exports = { list, create, update, idParam };

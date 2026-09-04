'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["is_aktif","createdAt"], ["program_studi_id","semester_id","is_aktif"]);
const create = Joi.object({
    program_studi_id: Joi.string().uuid().required(),
    semester_id: Joi.string().uuid().allow(null),
    is_aktif: Joi.boolean().allow(null),
    tanggal_krs_mulai: Joi.date().allow(null),
    tanggal_krs_selesai: Joi.date().allow(null),
    tanggal_revisi_mulai: Joi.date().allow(null),
    tanggal_revisi_selesai: Joi.date().allow(null),
    sks_default: Joi.number().allow(null),
    sks_maksimal: Joi.number().allow(null),
});
const update = Joi.object({
    program_studi_id: Joi.string().uuid().allow(null),
    semester_id: Joi.string().uuid().allow(null),
    is_aktif: Joi.boolean().allow(null),
    tanggal_krs_mulai: Joi.date().allow(null),
    tanggal_krs_selesai: Joi.date().allow(null),
    tanggal_revisi_mulai: Joi.date().allow(null),
    tanggal_revisi_selesai: Joi.date().allow(null),
    sks_default: Joi.number().allow(null),
    sks_maksimal: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

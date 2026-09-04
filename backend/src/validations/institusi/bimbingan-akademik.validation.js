'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["tahun_akademik","status","createdAt"], ["dosen_id","mahasiswa_id","status"]);
const create = Joi.object({
    dosen_id: Joi.string().uuid().required(),
    mahasiswa_id: Joi.string().uuid().required(),
    tahun_akademik: Joi.string().max(10).allow(null),
    status: Joi.string().valid('aktif', 'selesai').allow(null),
    catatan: Joi.string().allow(null),
});
const update = Joi.object({
    dosen_id: Joi.string().uuid().allow(null),
    mahasiswa_id: Joi.string().uuid().allow(null),
    tahun_akademik: Joi.string().max(10).allow(null),
    status: Joi.string().valid('aktif', 'selesai').allow(null),
    catatan: Joi.string().allow(null),
});

module.exports = { list, create, update, idParam };

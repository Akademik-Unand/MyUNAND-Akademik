'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["hari","createdAt"], ["kelas_id","ruang_id","hari"]);
const create = Joi.object({
    kelas_id: Joi.string().uuid().required(),
    ruang_id: Joi.string().uuid().allow(null),
    hari: Joi.string().valid('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu').required(),
    jam_mulai: Joi.string().allow(null),
    jam_selesai: Joi.string().allow(null),
});
const update = Joi.object({
    kelas_id: Joi.string().uuid().allow(null),
    ruang_id: Joi.string().uuid().allow(null),
    hari: Joi.string().valid('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu').allow(null),
    jam_mulai: Joi.string().allow(null),
    jam_selesai: Joi.string().allow(null),
});

module.exports = { list, create, update, idParam };

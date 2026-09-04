'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["createdAt"], ["kelas_id","cpmk_id"]);
const create = Joi.object({
    kelas_id: Joi.string().uuid().required(),
    cpmk_id: Joi.string().uuid().required(),
    target_nilai_min: Joi.number().allow(null),
    target_persen_lulus: Joi.number().allow(null),
    capaian_persen: Joi.number().allow(null),
    rata_rata: Joi.number().allow(null),
    jumlah_lulus: Joi.number().allow(null),
    analisis: Joi.string().allow(null),
    tindak_lanjut: Joi.string().allow(null),
});
const update = Joi.object({
    kelas_id: Joi.string().uuid().allow(null),
    cpmk_id: Joi.string().uuid().allow(null),
    target_nilai_min: Joi.number().allow(null),
    target_persen_lulus: Joi.number().allow(null),
    capaian_persen: Joi.number().allow(null),
    rata_rata: Joi.number().allow(null),
    jumlah_lulus: Joi.number().allow(null),
    analisis: Joi.string().allow(null),
    tindak_lanjut: Joi.string().allow(null),
});

module.exports = { list, create, update, idParam };

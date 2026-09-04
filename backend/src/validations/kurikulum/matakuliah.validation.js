'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["kode_matakuliah","nama_resmi","createdAt"], ["kode_matakuliah","jenis_semester_id","tipe_matakuliah_id"]);
const create = Joi.object({
    jenis_semester_id: Joi.string().uuid().required(),
    tipe_matakuliah_id: Joi.string().uuid().allow(null),
    sifat_matakuliah_id: Joi.string().uuid().allow(null),
    kode_matakuliah: Joi.string().max(255).required(),
    nama_resmi: Joi.string().max(255).allow(null),
    semester_kurikulum: Joi.number().allow(null),
    jumlah_sks_kurikulum: Joi.number().allow(null),
    jumlah_sks_teori: Joi.number().allow(null),
    jumlah_sks_praktikum: Joi.number().allow(null),
    jumlah_sks_praktikum_lapangan: Joi.number().allow(null),
    bobot_nilai_minimal_lulus: Joi.number().allow(null),
});
const update = Joi.object({
    jenis_semester_id: Joi.string().uuid().allow(null),
    tipe_matakuliah_id: Joi.string().uuid().allow(null),
    sifat_matakuliah_id: Joi.string().uuid().allow(null),
    kode_matakuliah: Joi.string().max(255).allow(null),
    nama_resmi: Joi.string().max(255).allow(null),
    semester_kurikulum: Joi.number().allow(null),
    jumlah_sks_kurikulum: Joi.number().allow(null),
    jumlah_sks_teori: Joi.number().allow(null),
    jumlah_sks_praktikum: Joi.number().allow(null),
    jumlah_sks_praktikum_lapangan: Joi.number().allow(null),
    bobot_nilai_minimal_lulus: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

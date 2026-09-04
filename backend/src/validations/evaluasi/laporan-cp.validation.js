'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["createdAt"], ["program_studi_id","kurikulum_id"]);
const create = Joi.object({
    program_studi_id: Joi.string().uuid().required(),
    kurikulum_id: Joi.string().uuid().allow(null),
    nama_laporan: Joi.string().max(255).required(),
    keterangan: Joi.string().allow(null),
    file_path: Joi.string().max(255).allow(null),
    dibuat_oleh: Joi.string().uuid().allow(null),
});
const update = Joi.object({
    program_studi_id: Joi.string().uuid().allow(null),
    kurikulum_id: Joi.string().uuid().allow(null),
    nama_laporan: Joi.string().max(255).allow(null),
    keterangan: Joi.string().allow(null),
    file_path: Joi.string().max(255).allow(null),
    dibuat_oleh: Joi.string().uuid().allow(null),
});

module.exports = { list, create, update, idParam };

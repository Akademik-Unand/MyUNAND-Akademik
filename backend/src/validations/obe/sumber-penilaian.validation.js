'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama_sumber_penilaian","createdAt"], ["cpmk_id"]);
const create = Joi.object({
    cpmk_id: Joi.string().uuid().required(),
    nama_sumber_penilaian: Joi.string().max(255).required(),
    bobot: Joi.number().allow(null),
});
const update = Joi.object({
    cpmk_id: Joi.string().uuid().allow(null),
    nama_sumber_penilaian: Joi.string().max(255).allow(null),
    bobot: Joi.number().allow(null),
});

module.exports = { list, create, update, idParam };

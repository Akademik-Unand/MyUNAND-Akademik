'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["nama_model","createdAt"], ["nama_model"]);
const create = Joi.object({
    nama_model: Joi.string().max(255).allow(null),
});
const update = Joi.object({
    nama_model: Joi.string().max(255).allow(null),
});

module.exports = { list, create, update, idParam };

'use strict';
const Joi = require('joi');
const { idParam,listQuery } = require('../common');
const list = listQuery(['kode','nama','createdAt'],['kode']);
const create = Joi.object({ kode:Joi.string().max(50).required(),nama:Joi.string().max(255).required(),alamat:Joi.string().allow('',null) });
const update = Joi.object({ kode:Joi.string().max(50),nama:Joi.string().max(255),alamat:Joi.string().allow('',null) }).min(1);
module.exports = { list,create,update,idParam };

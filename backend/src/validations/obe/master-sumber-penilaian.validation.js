"use strict";

const Joi = require("joi");
const { idParam, listQuery } = require("../common");

const list = listQuery(
  ["urutan", "kode", "nama", "kategori", "bobot_default", "createdAt"],
  ["fakultas_id", "kategori", "is_aktif"],
);

const create = Joi.object({
  kode: Joi.string().max(30).required(),
  nama: Joi.string().max(100).required(),
  kategori: Joi.string().max(100).allow(null, ""),
  bobot_default: Joi.number().min(0).max(100).allow(null),
  fakultas_id: Joi.string().uuid().allow(null, ""),
  deskripsi: Joi.string().allow(null, ""),
  urutan: Joi.number().integer().min(0).allow(null),
  is_aktif: Joi.boolean().allow(null),
});

const update = Joi.object({
  kode: Joi.string().max(30).allow(null),
  nama: Joi.string().max(100).allow(null),
  kategori: Joi.string().max(100).allow(null, ""),
  bobot_default: Joi.number().min(0).max(100).allow(null),
  fakultas_id: Joi.string().uuid().allow(null, ""),
  deskripsi: Joi.string().allow(null, ""),
  urutan: Joi.number().integer().min(0).allow(null),
  is_aktif: Joi.boolean().allow(null),
});

module.exports = { list, create, update, idParam };

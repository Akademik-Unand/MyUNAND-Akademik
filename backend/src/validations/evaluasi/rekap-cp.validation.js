'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const list = listQuery(["createdAt"], uniqueFields(["mahasiswa_id","cp_id","semester_prodi_id"], ORG_FILTER_FIELDS));

const DETAIL_FILTER_FIELDS = uniqueFields(
  ['mahasiswa_id', 'cp_id', 'scp_id', 'semester_prodi_id', 'matakuliah_id', 'kelas_id', 'angkatan', 'transkrip_saja', 'pilihan_data'],
  ORG_FILTER_FIELDS
);

const listDetail = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(200),
  search: Joi.string().allow(''),
  sortBy: Joi.string(),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC'),
  filter: Joi.object().pattern(
    Joi.string().valid(...DETAIL_FILTER_FIELDS),
    Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array())
  ),
});
const create = Joi.object({
    mahasiswa_id: Joi.string().uuid().required(),
    cp_id: Joi.string().uuid().required(),
    semester_prodi_id: Joi.string().uuid().allow(null),
    nilai_capaian: Joi.number().allow(null),
    status_lulus: Joi.boolean().allow(null),
});
const update = Joi.object({
    mahasiswa_id: Joi.string().uuid().allow(null),
    cp_id: Joi.string().uuid().allow(null),
    semester_prodi_id: Joi.string().uuid().allow(null),
    nilai_capaian: Joi.number().allow(null),
    status_lulus: Joi.boolean().allow(null),
});

module.exports = { list, listDetail, create, update, idParam };

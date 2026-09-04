'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const scpIds = Joi.array().items(Joi.string().uuid());

const requireScpWhenChild = (value, helpers) => {
  if (value.parent_cpmk_id && (!value.scp_ids || value.scp_ids.length < 1)) {
    return helpers.message('Sub-CPMK wajib memilih minimal satu SCP');
  }
  return value;
};

const list = listQuery(['nama_cpmk', 'createdAt'], uniqueFields(['matakuliah_id', 'parent_cpmk_id'], ORG_FILTER_FIELDS));
const create = Joi.object({
  matakuliah_id: Joi.string().uuid().required(),
  nama_cpmk: Joi.string().max(255).required(),
  deskripsi: Joi.string().allow(null, ''),
  parent_cpmk_id: Joi.string().uuid().allow(null),
  scp_ids: scpIds.default([]),
}).custom(requireScpWhenChild);

const update = Joi.object({
  matakuliah_id: Joi.string().uuid().allow(null),
  nama_cpmk: Joi.string().max(255).allow(null),
  deskripsi: Joi.string().allow(null, ''),
  parent_cpmk_id: Joi.string().uuid().allow(null),
  scp_ids: scpIds,
}).custom(requireScpWhenChild);

module.exports = { list, create, update, idParam };

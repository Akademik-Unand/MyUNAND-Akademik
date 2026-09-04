'use strict';

const Joi = require('joi');
const { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields } = require('../common');

const scpIds = Joi.array().items(Joi.string().uuid());

const requiredText = (label) => Joi.string().trim().min(1).required().messages({
  'string.empty': `${label} wajib diisi`,
  'string.min': `${label} wajib diisi`,
  'any.required': `${label} wajib diisi`,
});

const subCpmkItem = Joi.object({
  nama_cpmk: Joi.string().trim().max(255).required(),
  deskripsi: requiredText('Deskripsi Sub-CPMK'),
  scp_ids: scpIds.min(1).required(),
});

const requireChildScp = (value, helpers) => {
  if (value.parent_cpmk_id && value.sub_cpmk?.length) {
    return helpers.message('Sub-CPMK tidak boleh memiliki Sub-CPMK');
  }
  if (value.parent_cpmk_id && (!value.scp_ids || value.scp_ids.length < 1)) {
    return helpers.message('Sub-CPMK wajib memilih minimal satu SCP');
  }
  return value;
};

const requireRootMapping = (value, helpers) => {
  const childCheck = requireChildScp(value, helpers);
  if (childCheck !== value) return childCheck;
  if (!value.parent_cpmk_id && !(value.sub_cpmk && value.sub_cpmk.length)) {
    if (!value.scp_ids || value.scp_ids.length < 1) {
      return helpers.message('Pilih minimal satu SCP, atau tambahkan Sub-CPMK');
    }
  }
  return value;
};

const list = listQuery(['nama_cpmk', 'createdAt'], uniqueFields(['matakuliah_id', 'parent_cpmk_id'], ORG_FILTER_FIELDS));
const create = Joi.object({
  matakuliah_id: Joi.string().uuid().required(),
  nama_cpmk: Joi.string().trim().max(255).required(),
  deskripsi: requiredText('Deskripsi CPMK'),
  parent_cpmk_id: Joi.string().uuid().allow(null),
  scp_ids: scpIds.default([]),
  sub_cpmk: Joi.array().items(subCpmkItem).min(1),
}).custom(requireRootMapping);

const update = Joi.object({
  matakuliah_id: Joi.string().uuid().allow(null),
  nama_cpmk: Joi.string().trim().max(255).allow(null),
  deskripsi: requiredText('Deskripsi CPMK'),
  parent_cpmk_id: Joi.string().uuid().allow(null),
  scp_ids: scpIds,
}).custom(requireChildScp);

const BULK_MAX = 100;
const createBulk = Joi.array().items(create).min(1).max(BULK_MAX).messages({
  'array.min': 'Minimal satu CPMK untuk ditambahkan',
  'array.max': `Maksimal ${BULK_MAX} CPMK dalam satu kali simpan`,
});

module.exports = { list, create, createBulk, update, idParam };

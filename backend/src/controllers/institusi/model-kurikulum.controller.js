'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const modelKurikulumService = require('../../services/institusi/model-kurikulum.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await modelKurikulumService.list(req.query);
  return success(res, {
    message: 'Data Model Kurikulum berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await modelKurikulumService.getById(req.params.id);
  return success(res, { message: 'Detail Model Kurikulum berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await modelKurikulumService.create(req.body);
  return success(res, { code: 201, message: 'Model Kurikulum berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await modelKurikulumService.update(req.params.id, req.body);
  return success(res, { message: 'Model Kurikulum berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await modelKurikulumService.remove(req.params.id);
  return success(res, { message: 'Model Kurikulum berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await modelKurikulumService.restore(req.params.id);
  return success(res, { message: 'Model Kurikulum berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

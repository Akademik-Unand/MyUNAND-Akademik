'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const universitasService = require('../../services/institusi/universitas.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await universitasService.list(req.query);
  return success(res, {
    message: 'Data Universitas berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await universitasService.getById(req.params.id);
  return success(res, { message: 'Detail Universitas berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await universitasService.create(req.body);
  return success(res, { code: 201, message: 'Universitas berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await universitasService.update(req.params.id, req.body);
  return success(res, { message: 'Universitas berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await universitasService.remove(req.params.id);
  return success(res, { message: 'Universitas berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await universitasService.restore(req.params.id);
  return success(res, { message: 'Universitas berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

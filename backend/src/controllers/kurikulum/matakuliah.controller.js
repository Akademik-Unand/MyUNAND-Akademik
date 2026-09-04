'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const matakuliahService = require('../../services/kurikulum/matakuliah.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await matakuliahService.list(req.query);
  return success(res, {
    message: 'Data Matakuliah berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await matakuliahService.getById(req.params.id);
  return success(res, { message: 'Detail Matakuliah berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await matakuliahService.create(req.body);
  return success(res, { code: 201, message: 'Matakuliah berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await matakuliahService.update(req.params.id, req.body);
  return success(res, { message: 'Matakuliah berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await matakuliahService.remove(req.params.id);
  return success(res, { message: 'Matakuliah berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await matakuliahService.restore(req.params.id);
  return success(res, { message: 'Matakuliah berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

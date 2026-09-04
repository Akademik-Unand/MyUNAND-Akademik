'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const matakuliahKurikulumService = require('../../services/kurikulum/matakuliah-kurikulum.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await matakuliahKurikulumService.list(req.query);
  return success(res, {
    message: 'Data Matakuliah Kurikulum berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await matakuliahKurikulumService.getById(req.params.id);
  return success(res, { message: 'Detail Matakuliah Kurikulum berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await matakuliahKurikulumService.create(req.body);
  return success(res, { code: 201, message: 'Matakuliah Kurikulum berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await matakuliahKurikulumService.update(req.params.id, req.body);
  return success(res, { message: 'Matakuliah Kurikulum berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await matakuliahKurikulumService.remove(req.params.id);
  return success(res, { message: 'Matakuliah Kurikulum berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

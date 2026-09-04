'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const sifatMatakuliahService = require('../../services/kurikulum/sifat-matakuliah.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await sifatMatakuliahService.list(req.query);
  return success(res, {
    message: 'Data Sifat Matakuliah berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await sifatMatakuliahService.getById(req.params.id);
  return success(res, { message: 'Detail Sifat Matakuliah berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await sifatMatakuliahService.create(req.body);
  return success(res, { code: 201, message: 'Sifat Matakuliah berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await sifatMatakuliahService.update(req.params.id, req.body);
  return success(res, { message: 'Sifat Matakuliah berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await sifatMatakuliahService.remove(req.params.id);
  return success(res, { message: 'Sifat Matakuliah berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

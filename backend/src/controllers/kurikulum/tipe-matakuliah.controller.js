'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const tipeMatakuliahService = require('../../services/kurikulum/tipe-matakuliah.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await tipeMatakuliahService.list(req.query);
  return success(res, {
    message: 'Data Tipe Matakuliah berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await tipeMatakuliahService.getById(req.params.id);
  return success(res, { message: 'Detail Tipe Matakuliah berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await tipeMatakuliahService.create(req.body);
  return success(res, { code: 201, message: 'Tipe Matakuliah berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await tipeMatakuliahService.update(req.params.id, req.body);
  return success(res, { message: 'Tipe Matakuliah berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await tipeMatakuliahService.remove(req.params.id);
  return success(res, { message: 'Tipe Matakuliah berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

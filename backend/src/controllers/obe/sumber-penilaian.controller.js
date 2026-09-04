'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const sumberPenilaianService = require('../../services/obe/sumber-penilaian.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await sumberPenilaianService.list(req.query);
  return success(res, {
    message: 'Data Sumber Penilaian berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await sumberPenilaianService.getById(req.params.id);
  return success(res, { message: 'Detail Sumber Penilaian berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await sumberPenilaianService.create(req.body);
  return success(res, { code: 201, message: 'Sumber Penilaian berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await sumberPenilaianService.update(req.params.id, req.body);
  return success(res, { message: 'Sumber Penilaian berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await sumberPenilaianService.remove(req.params.id);
  return success(res, { message: 'Sumber Penilaian berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

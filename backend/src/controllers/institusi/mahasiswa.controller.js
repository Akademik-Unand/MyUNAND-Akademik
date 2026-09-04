'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const mahasiswaService = require('../../services/institusi/mahasiswa.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await mahasiswaService.list(req.query);
  return success(res, {
    message: 'Data Mahasiswa berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await mahasiswaService.getById(req.params.id);
  return success(res, { message: 'Detail Mahasiswa berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await mahasiswaService.create(req.body);
  return success(res, { code: 201, message: 'Mahasiswa berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await mahasiswaService.update(req.params.id, req.body);
  return success(res, { message: 'Mahasiswa berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await mahasiswaService.remove(req.params.id);
  return success(res, { message: 'Mahasiswa berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await mahasiswaService.restore(req.params.id);
  return success(res, { message: 'Mahasiswa berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

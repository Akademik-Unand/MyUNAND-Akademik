'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const nilaiService = require('../../services/nilai/nilai.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await nilaiService.list(req.query);
  return success(res, { message: 'Data Nilai Mahasiswa berhasil diambil', data: rows, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const data = await nilaiService.getById(req.params.id);
  return success(res, { message: 'Detail Nilai Mahasiswa berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await nilaiService.create(req.body);
  return success(res, { code: 201, message: 'Nilai Mahasiswa berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await nilaiService.update(req.params.id, req.body);
  return success(res, { message: 'Nilai Mahasiswa berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await nilaiService.remove(req.params.id);
  return success(res, { message: 'Nilai Mahasiswa berhasil dihapus', data });
});

const uploadBulk = asyncHandler(async (req, res) => {
  const data = await nilaiService.uploadBulk(req.body, req.user?.id);
  return success(res, {
    message: `Berhasil memproses ${data.length} data nilai mahasiswa`,
    data,
  });
});

module.exports = { list, getById, create, update, remove, uploadBulk };

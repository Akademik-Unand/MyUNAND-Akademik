'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const historyUploadNilaiService = require('../../services/evaluasi/history-upload-nilai.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await historyUploadNilaiService.list(req.query);
  return success(res, {
    message: 'Data History Upload Nilai berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await historyUploadNilaiService.getById(req.params.id);
  return success(res, { message: 'Detail History Upload Nilai berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await historyUploadNilaiService.create(req.body);
  return success(res, { code: 201, message: 'History Upload Nilai berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await historyUploadNilaiService.update(req.params.id, req.body);
  return success(res, { message: 'History Upload Nilai berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await historyUploadNilaiService.remove(req.params.id);
  return success(res, { message: 'History Upload Nilai berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

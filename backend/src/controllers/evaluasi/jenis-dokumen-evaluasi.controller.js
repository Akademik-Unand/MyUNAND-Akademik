'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const jenisDokumenEvaluasiService = require('../../services/evaluasi/jenis-dokumen-evaluasi.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await jenisDokumenEvaluasiService.list(req.query);
  return success(res, {
    message: 'Data Jenis Dokumen Evaluasi berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await jenisDokumenEvaluasiService.getById(req.params.id);
  return success(res, { message: 'Detail Jenis Dokumen Evaluasi berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await jenisDokumenEvaluasiService.create(req.body);
  return success(res, { code: 201, message: 'Jenis dokumen evaluasi berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await jenisDokumenEvaluasiService.update(req.params.id, req.body);
  return success(res, { message: 'Jenis dokumen evaluasi berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await jenisDokumenEvaluasiService.remove(req.params.id);
  return success(res, { message: 'Jenis dokumen evaluasi berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await jenisDokumenEvaluasiService.restore(req.params.id);
  return success(res, { message: 'Jenis dokumen evaluasi berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

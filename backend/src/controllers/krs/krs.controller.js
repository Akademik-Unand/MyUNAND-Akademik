'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const krsService = require('../../services/krs/krs.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await krsService.list(req.query);
  return success(res, { message: 'Data KRS berhasil diambil', data: rows, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const data = await krsService.getById(req.params.id);
  return success(res, { message: 'Detail KRS berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await krsService.create(req.body);
  return success(res, { code: 201, message: 'KRS berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await krsService.update(req.params.id, req.body);
  return success(res, { message: 'KRS berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await krsService.remove(req.params.id);
  return success(res, { message: 'KRS berhasil dihapus', data });
});

const approve = asyncHandler(async (req, res) => {
  const data = await krsService.approve(req.params.id, req.body);
  return success(res, { message: 'KRS berhasil disetujui', data });
});

const updateDetilStatus = asyncHandler(async (req, res) => {
  const data = await krsService.updateDetilStatus(req.params.detilId, req.body.approved);
  return success(res, { message: 'Status KRS Detil berhasil diperbarui', data });
});

const getByMahasiswa = asyncHandler(async (req, res) => {
  const data = await krsService.getByMahasiswa(req.params.mahasiswaId);
  return success(res, { message: 'Riwayat KRS mahasiswa berhasil diambil', data });
});

module.exports = { list, getById, create, update, remove, approve, updateDetilStatus, getByMahasiswa };

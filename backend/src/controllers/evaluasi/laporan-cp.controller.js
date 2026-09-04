'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const laporanCpService = require('../../services/evaluasi/laporan-cp.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await laporanCpService.list(req.query);
  return success(res, {
    message: 'Data Laporan CP berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await laporanCpService.getById(req.params.id);
  return success(res, { message: 'Detail Laporan CP berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await laporanCpService.create(req.body);
  return success(res, { code: 201, message: 'Laporan CP berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await laporanCpService.update(req.params.id, req.body);
  return success(res, { message: 'Laporan CP berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await laporanCpService.remove(req.params.id);
  return success(res, { message: 'Laporan CP berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

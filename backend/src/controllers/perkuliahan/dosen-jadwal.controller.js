'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const dosenJadwalService = require('../../services/perkuliahan/dosen-jadwal.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await dosenJadwalService.list(req.query);
  return success(res, {
    message: 'Data Dosen Jadwal berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await dosenJadwalService.getById(req.params.id);
  return success(res, { message: 'Detail Dosen Jadwal berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await dosenJadwalService.create(req.body);
  return success(res, { code: 201, message: 'Dosen Jadwal berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await dosenJadwalService.update(req.params.id, req.body);
  return success(res, { message: 'Dosen Jadwal berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await dosenJadwalService.remove(req.params.id);
  return success(res, { message: 'Dosen Jadwal berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

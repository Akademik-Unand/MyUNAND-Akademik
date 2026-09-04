'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const jadwalKelasService = require('../../services/perkuliahan/jadwal-kelas.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await jadwalKelasService.list(req.query);
  return success(res, {
    message: 'Data Jadwal Kelas berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await jadwalKelasService.getById(req.params.id);
  return success(res, { message: 'Detail Jadwal Kelas berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await jadwalKelasService.create(req.body);
  return success(res, { code: 201, message: 'Jadwal Kelas berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await jadwalKelasService.update(req.params.id, req.body);
  return success(res, { message: 'Jadwal Kelas berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await jadwalKelasService.remove(req.params.id);
  return success(res, { message: 'Jadwal Kelas berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

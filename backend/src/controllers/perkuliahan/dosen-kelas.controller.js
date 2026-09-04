'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const dosenKelasService = require('../../services/perkuliahan/dosen-kelas.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await dosenKelasService.list(req.query);
  return success(res, {
    message: 'Data Dosen Kelas berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await dosenKelasService.getById(req.params.id);
  return success(res, { message: 'Detail Dosen Kelas berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await dosenKelasService.create(req.body);
  return success(res, { code: 201, message: 'Dosen Kelas berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await dosenKelasService.update(req.params.id, req.body);
  return success(res, { message: 'Dosen Kelas berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await dosenKelasService.remove(req.params.id);
  return success(res, { message: 'Dosen Kelas berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

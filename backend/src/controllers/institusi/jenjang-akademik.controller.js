'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const jenjangAkademikService = require('../../services/institusi/jenjang-akademik.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await jenjangAkademikService.list(req.query);
  return success(res, {
    message: 'Data Jenjang Akademik berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await jenjangAkademikService.getById(req.params.id);
  return success(res, { message: 'Detail Jenjang Akademik berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await jenjangAkademikService.create(req.body);
  return success(res, { code: 201, message: 'Jenjang Akademik berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await jenjangAkademikService.update(req.params.id, req.body);
  return success(res, { message: 'Jenjang Akademik berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await jenjangAkademikService.remove(req.params.id);
  return success(res, { message: 'Jenjang Akademik berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await jenjangAkademikService.restore(req.params.id);
  return success(res, { message: 'Jenjang Akademik berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

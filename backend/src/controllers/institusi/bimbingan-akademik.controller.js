'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const bimbinganAkademikService = require('../../services/institusi/bimbingan-akademik.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await bimbinganAkademikService.list(req.query);
  return success(res, {
    message: 'Data Bimbingan Akademik berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.getById(req.params.id);
  return success(res, { message: 'Detail Bimbingan Akademik berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.create(req.body);
  return success(res, { code: 201, message: 'Bimbingan Akademik berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.update(req.params.id, req.body);
  return success(res, { message: 'Bimbingan Akademik berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.remove(req.params.id);
  return success(res, { message: 'Bimbingan Akademik berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

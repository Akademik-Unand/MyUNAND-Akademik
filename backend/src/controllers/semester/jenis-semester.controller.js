'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const jenisSemesterService = require('../../services/semester/jenis-semester.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await jenisSemesterService.list(req.query);
  return success(res, {
    message: 'Data Jenis Semester berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await jenisSemesterService.getById(req.params.id);
  return success(res, { message: 'Detail Jenis Semester berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await jenisSemesterService.create(req.body);
  return success(res, { code: 201, message: 'Jenis Semester berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await jenisSemesterService.update(req.params.id, req.body);
  return success(res, { message: 'Jenis Semester berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await jenisSemesterService.remove(req.params.id);
  return success(res, { message: 'Jenis Semester berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await jenisSemesterService.restore(req.params.id);
  return success(res, { message: 'Jenis Semester berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

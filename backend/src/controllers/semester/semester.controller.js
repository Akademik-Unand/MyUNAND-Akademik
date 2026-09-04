'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const semesterService = require('../../services/semester/semester.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await semesterService.list(req.query);
  return success(res, {
    message: 'Data Semester berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await semesterService.getById(req.params.id);
  return success(res, { message: 'Detail Semester berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await semesterService.create(req.body);
  return success(res, { code: 201, message: 'Semester berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await semesterService.update(req.params.id, req.body);
  return success(res, { message: 'Semester berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await semesterService.remove(req.params.id);
  return success(res, { message: 'Semester berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await semesterService.restore(req.params.id);
  return success(res, { message: 'Semester berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

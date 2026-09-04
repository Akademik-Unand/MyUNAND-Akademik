'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const semesterProdiService = require('../../services/semester/semester-prodi.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await semesterProdiService.list(req.query);
  return success(res, {
    message: 'Data Semester Prodi berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await semesterProdiService.getById(req.params.id);
  return success(res, { message: 'Detail Semester Prodi berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await semesterProdiService.create(req.body);
  return success(res, { code: 201, message: 'Semester Prodi berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await semesterProdiService.update(req.params.id, req.body);
  return success(res, { message: 'Semester Prodi berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await semesterProdiService.remove(req.params.id);
  return success(res, { message: 'Semester Prodi berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

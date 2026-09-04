'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const permissionsService = require('../../services/iam/permissions.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await permissionsService.list(req.query);
  return success(res, {
    message: 'Data Permission berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await permissionsService.getById(req.params.id);
  return success(res, { message: 'Detail Permission berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await permissionsService.create(req.body);
  return success(res, { code: 201, message: 'Permission berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await permissionsService.update(req.params.id, req.body);
  return success(res, { message: 'Permission berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await permissionsService.remove(req.params.id);
  return success(res, { message: 'Permission berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await permissionsService.restore(req.params.id);
  return success(res, { message: 'Permission berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

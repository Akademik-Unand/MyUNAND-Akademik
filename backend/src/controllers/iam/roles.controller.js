'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const rolesService = require('../../services/iam/roles.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await rolesService.list(req.query);
  return success(res, {
    message: 'Data Role berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await rolesService.getById(req.params.id);
  return success(res, { message: 'Detail Role berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await rolesService.create(req.body);
  return success(res, { code: 201, message: 'Role berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await rolesService.update(req.params.id, req.body);
  return success(res, { message: 'Role berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await rolesService.remove(req.params.id);
  return success(res, { message: 'Role berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await rolesService.restore(req.params.id);
  return success(res, { message: 'Role berhasil dipulihkan', data });
});

const matrix = asyncHandler(async (req, res) => {
  const data = await rolesService.getMatrix();
  return success(res, { message: 'Matriks role-permission berhasil diambil', data });
});

const syncPermissions = asyncHandler(async (req, res) => {
  const data = await rolesService.syncPermissions(req.params.id, req.body.permission_ids);
  return success(res, { message: 'Permission role berhasil disimpan', data });
});

module.exports = { list, getById, create, update, remove, restore, matrix, syncPermissions };

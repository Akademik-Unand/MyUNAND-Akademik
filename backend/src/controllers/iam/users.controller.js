'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const usersService = require('../../services/iam/users.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await usersService.list(req.query);
  return success(res, { message: 'Data User berhasil diambil', data: rows, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const data = await usersService.getById(req.params.id);
  return success(res, { message: 'Detail User berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await usersService.create(req.body);
  return success(res, { code: 201, message: 'User berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await usersService.update(req.params.id, req.body);
  return success(res, { message: 'User berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await usersService.remove(req.params.id);
  return success(res, { message: 'User berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await usersService.restore(req.params.id);
  return success(res, { message: 'User berhasil dipulihkan', data });
});

const assignRoles = asyncHandler(async (req, res) => {
  const data = await usersService.assignRoles(req.params.id, req.body.role_ids);
  return success(res, { message: 'Role user berhasil diperbarui', data });
});

const assignUnits = asyncHandler(async (req, res) => {
  const data = await usersService.assignUnits(req.params.id, req.body.units || []);
  return success(res, { message: 'Unit user berhasil diperbarui', data });
});

module.exports = { list, getById, create, update, remove, restore, assignRoles, assignUnits };

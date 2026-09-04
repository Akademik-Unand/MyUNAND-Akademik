'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const scpService = require('../../services/obe/scp.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await scpService.list(req.query);
  return success(res, {
    message: 'Data SCP berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await scpService.getById(req.params.id);
  return success(res, { message: 'Detail SCP berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await scpService.create(req.body);
  return success(res, { code: 201, message: 'SCP berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await scpService.update(req.params.id, req.body);
  return success(res, { message: 'SCP berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await scpService.remove(req.params.id);
  return success(res, { message: 'SCP berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await scpService.restore(req.params.id);
  return success(res, { message: 'SCP berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

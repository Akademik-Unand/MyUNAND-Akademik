'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const cpmkService = require('../../services/obe/cpmk.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await cpmkService.list(req.query);
  return success(res, {
    message: 'Data CPMK berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await cpmkService.getById(req.params.id);
  return success(res, { message: 'Detail CPMK berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await cpmkService.create(req.body);
  return success(res, { code: 201, message: 'CPMK berhasil ditambahkan', data });
});

const createBulk = asyncHandler(async (req, res) => {
  const data = await cpmkService.createBulk(req.body);
  return success(res, {
    code: 201,
    message: `${data.length} CPMK berhasil ditambahkan`,
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await cpmkService.update(req.params.id, req.body);
  return success(res, { message: 'CPMK berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await cpmkService.remove(req.params.id);
  return success(res, { message: 'CPMK berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await cpmkService.restore(req.params.id);
  return success(res, { message: 'CPMK berhasil dipulihkan', data });
});

module.exports = { list, getById, create, createBulk, update, remove, restore };

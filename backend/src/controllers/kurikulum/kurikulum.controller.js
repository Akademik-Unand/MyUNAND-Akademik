'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const kurikulumService = require('../../services/kurikulum/kurikulum.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await kurikulumService.list(req.query);
  return success(res, {
    message: 'Data Kurikulum berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await kurikulumService.getById(req.params.id);
  return success(res, { message: 'Detail Kurikulum berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await kurikulumService.create(req.body);
  return success(res, { code: 201, message: 'Kurikulum berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await kurikulumService.update(req.params.id, req.body);
  return success(res, { message: 'Kurikulum berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await kurikulumService.remove(req.params.id);
  return success(res, { message: 'Kurikulum berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await kurikulumService.restore(req.params.id);
  return success(res, { message: 'Kurikulum berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };

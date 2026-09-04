'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const cpmkScpService = require('../../services/obe/cpmk-scp.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await cpmkScpService.list(req.query);
  return success(res, {
    message: 'Data CPMK SCP berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await cpmkScpService.getById(req.params.id);
  return success(res, { message: 'Detail CPMK SCP berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await cpmkScpService.create(req.body);
  return success(res, { code: 201, message: 'CPMK SCP berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await cpmkScpService.update(req.params.id, req.body);
  return success(res, { message: 'CPMK SCP berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await cpmkScpService.remove(req.params.id);
  return success(res, { message: 'CPMK SCP berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };

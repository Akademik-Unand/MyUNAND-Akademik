'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const rekapCpService = require('../../services/evaluasi/rekap-cp.service');
const rekapCpDetailService = require('../../services/evaluasi/rekap-cp-detail.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await rekapCpService.list(req.query);
  return success(res, {
    message: 'Data Rekap CP berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await rekapCpService.getById(req.params.id);
  return success(res, { message: 'Detail Rekap CP berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await rekapCpService.create(req.body);
  return success(res, { code: 201, message: 'Rekap CP berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await rekapCpService.update(req.params.id, req.body);
  return success(res, { message: 'Rekap CP berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await rekapCpService.remove(req.params.id);
  return success(res, { message: 'Rekap CP berhasil dihapus', data });
});

const listGrafik = asyncHandler(async (req, res) => {
  const data = await rekapCpDetailService.listGrafik(req.query);
  return success(res, { message: 'Grafik rekap CP berhasil diambil', data });
});

const listDetail = asyncHandler(async (req, res) => {
  const { rows, pagination } = await rekapCpDetailService.listDetail(req.query);
  return success(res, {
    message: 'Data rekap nilai CP berhasil diambil',
    data: rows,
    pagination,
  });
});

module.exports = { list, getById, create, update, remove, listDetail, listGrafik };

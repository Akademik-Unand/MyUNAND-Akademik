"use strict";

const asyncHandler = require("../../middleware/asyncHandler");
const { success } = require("../../helpers/response");
const masterSumberPenilaianService = require("../../services/obe/master-sumber-penilaian.service");

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await masterSumberPenilaianService.list(req.query);
  return success(res, {
    message: "Data Master Sumber Penilaian berhasil diambil",
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await masterSumberPenilaianService.getById(req.params.id);
  return success(res, {
    message: "Detail Master Sumber Penilaian berhasil diambil",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await masterSumberPenilaianService.create(req.body);
  return success(res, {
    code: 201,
    message: "Master Sumber Penilaian berhasil ditambahkan",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await masterSumberPenilaianService.update(req.params.id, req.body);
  return success(res, {
    message: "Master Sumber Penilaian berhasil diperbarui",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await masterSumberPenilaianService.remove(req.params.id);
  return success(res, {
    message: "Master Sumber Penilaian berhasil dihapus",
    data,
  });
});

const restore = asyncHandler(async (req, res) => {
  const data = await masterSumberPenilaianService.restore(req.params.id);
  return success(res, {
    message: "Master Sumber Penilaian berhasil dipulihkan",
    data,
  });
});

module.exports = { list, getById, create, update, remove, restore };

"use strict";
const asyncHandler = require("../../middleware/asyncHandler");
const { success } = require("../../helpers/response");
const service = require("../../services/perkuliahan/gedung.service");
const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await service.list(req.query);
  return success(res, {
    message: "Data Gedung berhasil diambil",
    data: rows,
    pagination,
  });
});
const getById = asyncHandler(async (req, res) =>
  success(res, {
    message: "Detail Gedung berhasil diambil",
    data: await service.getById(req.params.id),
  }),
);
const create = asyncHandler(async (req, res) =>
  success(res, {
    code: 201,
    message: "Gedung berhasil ditambahkan",
    data: await service.create(req.body),
  }),
);
const update = asyncHandler(async (req, res) =>
  success(res, {
    message: "Gedung berhasil diperbarui",
    data: await service.update(req.params.id, req.body),
  }),
);
const remove = asyncHandler(async (req, res) =>
  success(res, {
    message: "Gedung berhasil dihapus",
    data: await service.remove(req.params.id),
  }),
);
const restore = asyncHandler(async (req, res) =>
  success(res, {
    message: "Gedung berhasil dipulihkan",
    data: await service.restore(req.params.id),
  }),
);
module.exports = { list, getById, create, update, remove, restore };

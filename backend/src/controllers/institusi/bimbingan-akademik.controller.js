"use strict";

const asyncHandler = require("../../middleware/asyncHandler");
const { success } = require("../../helpers/response");
const bimbinganAkademikService = require("../../services/institusi/bimbingan-akademik.service");

/**
 * Konteks aktor: `user` dipakai untuk membatasi data ke bimbingan dosen yang
 * bersangkutan, scope organisasi dipakai untuk membatasi operasi tulis.
 */
const actor = (req) => ({
  user: req.user,
  access: req.access,
  orgScope: req.orgScope,
});

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await bimbinganAkademikService.list(
    req.query,
    actor(req),
  );
  return success(res, {
    message: "Data Bimbingan Akademik berhasil diambil",
    data: rows,
    pagination,
  });
});

/** GET /bimbingan-akademik/candidates — mahasiswa yang belum punya dosen PA. */
const listCandidates = asyncHandler(async (req, res) => {
  const { rows, pagination } = await bimbinganAkademikService.listCandidates(
    req.query,
    actor(req),
  );
  return success(res, {
    message: "Kandidat mahasiswa tanpa dosen PA berhasil diambil",
    data: rows,
    pagination,
  });
});

/** GET /bimbingan-akademik/summary — ringkasan cakupan PA & beban dosen. */
const summary = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.summary(req.query, actor(req));
  return success(res, {
    message: "Ringkasan bimbingan akademik berhasil diambil",
    data,
  });
});

/** GET /bimbingan-akademik/saya — mahasiswa bimbingan milik dosen yang login. */
const listSaya = asyncHandler(async (req, res) => {
  const { rows, pagination } = await bimbinganAkademikService.listSaya(
    req.query,
    actor(req),
  );
  return success(res, {
    message: "Daftar mahasiswa bimbingan berhasil diambil",
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.getById(req.params.id);
  return success(res, {
    message: "Detail Bimbingan Akademik berhasil diambil",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.create(req.body, actor(req));
  return success(res, {
    code: 201,
    message: "Dosen PA berhasil ditetapkan",
    data,
  });
});

/** POST /bimbingan-akademik/assign-bulk — satu dosen untuk banyak mahasiswa. */
const assignBulk = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.assignBulk(req.body, actor(req));
  return success(res, {
    code: 201,
    message: "Penetapan dosen PA massal selesai",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.update(
    req.params.id,
    req.body,
    actor(req),
  );
  return success(res, {
    message: "Bimbingan Akademik berhasil diperbarui",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await bimbinganAkademikService.remove(req.params.id, actor(req));
  return success(res, { message: "Bimbingan Akademik berhasil dihapus", data });
});

module.exports = {
  list,
  listCandidates,
  listSaya,
  summary,
  getById,
  create,
  assignBulk,
  update,
  remove,
};

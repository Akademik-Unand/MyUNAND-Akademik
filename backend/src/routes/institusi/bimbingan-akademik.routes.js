"use strict";

const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const validate = require("../../middleware/validate");
const bimbinganAkademikValidation = require("../../validations/institusi/bimbingan-akademik.validation");
const bimbinganAkademikController = require("../../controllers/institusi/bimbingan-akademik.controller");

const subject = "BimbinganAkademik";

/** GET /bimbingan-akademik */
router.get(
  "/",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ query: bimbinganAkademikValidation.list }),
  bimbinganAkademikController.list,
);

/**
 * GET /bimbingan-akademik/saya
 * Mahasiswa bimbingan milik dosen yang sedang login (role dosen / dosen-pa),
 * lengkap dengan ringkasan KRS semester berjalan.
 */
router.get(
  "/saya",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ query: bimbinganAkademikValidation.saya }),
  bimbinganAkademikController.listSaya,
);

/**
 * GET /bimbingan-akademik/candidates
 * Mahasiswa yang belum punya dosen PA aktif — calon yang terblokir ambil KRS.
 */
router.get(
  "/candidates",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ query: bimbinganAkademikValidation.candidates }),
  bimbinganAkademikController.listCandidates,
);

/** GET /bimbingan-akademik/summary */
router.get(
  "/summary",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ query: bimbinganAkademikValidation.summaryQuery }),
  bimbinganAkademikController.summary,
);

/** POST /bimbingan-akademik */
router.post(
  "/",
  authenticate,
  attachAbility,
  checkPermission("create", subject),
  validate({ body: bimbinganAkademikValidation.create }),
  bimbinganAkademikController.create,
);

/** POST /bimbingan-akademik/assign-bulk — tetapkan satu dosen ke banyak mahasiswa. */
router.post(
  "/assign-bulk",
  authenticate,
  attachAbility,
  checkPermission("create", subject),
  validate({ body: bimbinganAkademikValidation.assignBulk }),
  bimbinganAkademikController.assignBulk,
);

/** GET /bimbingan-akademik/:id */
router.get(
  "/:id",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ params: bimbinganAkademikValidation.idParam }),
  bimbinganAkademikController.getById,
);

/** PUT /bimbingan-akademik/:id */
router.put(
  "/:id",
  authenticate,
  attachAbility,
  checkPermission("update", subject),
  validate({
    params: bimbinganAkademikValidation.idParam,
    body: bimbinganAkademikValidation.update,
  }),
  bimbinganAkademikController.update,
);

/** DELETE /bimbingan-akademik/:id */
router.delete(
  "/:id",
  authenticate,
  attachAbility,
  checkPermission("delete", subject),
  validate({ params: bimbinganAkademikValidation.idParam }),
  bimbinganAkademikController.remove,
);

module.exports = router;

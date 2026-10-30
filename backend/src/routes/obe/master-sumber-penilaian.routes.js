"use strict";

const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const validate = require("../../middleware/validate");
const masterSumberPenilaianValidation = require("../../validations/obe/master-sumber-penilaian.validation");
const masterSumberPenilaianController = require("../../controllers/obe/master-sumber-penilaian.controller");

const subject = "SumberPenilaian";

router.get(
  "/",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ query: masterSumberPenilaianValidation.list }),
  masterSumberPenilaianController.list,
);

router.post(
  "/",
  authenticate,
  attachAbility,
  checkPermission("create", subject),
  validate({ body: masterSumberPenilaianValidation.create }),
  masterSumberPenilaianController.create,
);

router.post(
  "/:id/restore",
  authenticate,
  attachAbility,
  checkPermission("restore", subject),
  validate({ params: masterSumberPenilaianValidation.idParam }),
  masterSumberPenilaianController.restore,
);

router.get(
  "/:id",
  authenticate,
  attachAbility,
  checkPermission("read", subject),
  validate({ params: masterSumberPenilaianValidation.idParam }),
  masterSumberPenilaianController.getById,
);

router.put(
  "/:id",
  authenticate,
  attachAbility,
  checkPermission("update", subject),
  validate({
    params: masterSumberPenilaianValidation.idParam,
    body: masterSumberPenilaianValidation.update,
  }),
  masterSumberPenilaianController.update,
);

router.delete(
  "/:id",
  authenticate,
  attachAbility,
  checkPermission("delete", subject),
  validate({ params: masterSumberPenilaianValidation.idParam }),
  masterSumberPenilaianController.remove,
);

module.exports = router;

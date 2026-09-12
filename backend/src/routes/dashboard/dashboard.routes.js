"use strict";

const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const dashboardController = require("../../controllers/dashboard/dashboard.controller");

/** GET /dashboard/summary */
router.get("/summary", authenticate, dashboardController.summary);

/** GET /dashboard/org-summary — data yang di-scope ke level organisasi user */
router.get(
  "/org-summary",
  authenticate,
  attachAbility,
  dashboardController.orgSummary,
);

/** GET /dashboard/dosen-summary — ringkasan dosen pembimbing akademik */
router.get(
  "/dosen-summary",
  authenticate,
  attachAbility,
  checkPermission("read", "BimbinganAkademik"),
  dashboardController.dosenSummary,
);

module.exports = router;

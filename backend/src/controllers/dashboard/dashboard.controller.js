"use strict";

const asyncHandler = require("../../middleware/asyncHandler");
const { success } = require("../../helpers/response");
const dashboardService = require("../../services/dashboard/dashboard.service");

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.summary();
  return success(res, {
    message: "Ringkasan dashboard berhasil diambil",
    data,
  });
});

/**
 * GET /dashboard/org-summary
 * Ringkasan data yang di-scope ke level organisasi user (prodi/departemen/fakultas).
 */
const orgSummary = asyncHandler(async (req, res) => {
  const scope = req.orgScope || {};
  const data = await dashboardService.orgSummary({
    level: scope.level,
    prodi_ids: scope.prodi_ids || [],
    departemen_ids: scope.departemen_ids || [],
    fakultas_ids: scope.fakultas_ids || [],
  });
  return success(res, {
    message: "Ringkasan dashboard organisasi berhasil diambil",
    data,
  });
});

/**
 * GET /dashboard/dosen-summary
 * Ringkasan dosen pembimbing akademik (role dosen/dosen-pa) yang dibatasi ke
 * mahasiswa bimbingannya sendiri.
 */
const dosenSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.dosenSummary(req.user);
  return success(res, {
    message: "Ringkasan dashboard dosen berhasil diambil",
    data,
  });
});

module.exports = { summary, orgSummary, dosenSummary };

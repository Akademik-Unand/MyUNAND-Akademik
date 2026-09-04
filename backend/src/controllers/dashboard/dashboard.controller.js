'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const dashboardService = require('../../services/dashboard/dashboard.service');

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.summary();
  return success(res, { message: 'Ringkasan dashboard berhasil diambil', data });
});

module.exports = { summary };

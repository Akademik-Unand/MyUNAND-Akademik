'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const activityLogsService = require('../../services/iam/activity-logs.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await activityLogsService.list(req.query);
  return success(res, {
    message: 'Data jejak aktivitas berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await activityLogsService.getById(req.params.id);
  return success(res, { message: 'Detail jejak aktivitas berhasil diambil', data });
});

module.exports = { list, getById };

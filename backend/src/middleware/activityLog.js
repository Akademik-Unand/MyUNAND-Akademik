'use strict';

const logger = require('../utils/logger');
const { shouldRecord, buildRecord } = require('../helpers/activityLog');

const activityLog = (req, res, next) => {
  res.on('finish', () => {
    if (!shouldRecord(req.method, req.originalUrl || req.url, res.statusCode)) return;

    const persist = async () => {
      const { ActivityLog } = require('../models');
      await ActivityLog.create(buildRecord(req, res));
    };

    persist().catch((err) => {
      logger.warn({ err }, 'Gagal mencatat aktivitas');
    });
  });

  return next();
};

module.exports = activityLog;

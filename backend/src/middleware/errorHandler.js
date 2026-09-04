'use strict';

const { error, serverError, validationError } = require('../helpers/response');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const log = req.log || logger;

  if (err.isJoi || err.name === 'ValidationError') {
    const details = (err.details || []).map((detail) => ({
      field: detail.path?.join('.') || detail.context?.key,
      message: String(detail.message || '').replace(/"/g, ''),
    }));
    return validationError(res, details);
  }

  if (err.name === 'AppError') {
    if (err.code >= 500) {
      log.error({ err }, err.message);
    } else {
      log.warn({ err }, err.message);
    }
    return error(res, {
      message: err.message,
      errors: err.errors,
      code: err.code,
    });
  }

  log.error({ err }, err.message || 'Unhandled error');

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((item) => ({ field: item.path, message: item.message }));
    return validationError(res, errors, 'Validation error');
  }

  if (err.name && err.name.startsWith('Sequelize')) {
    return error(res, { message: err.message, code: 400 });
  }

  return serverError(res, err.message || 'Internal server error');
};

module.exports = errorHandler;

'use strict';

/**
 * Format response standar API myUnand
 * Konsisten dengan format ResponseTrait di Laravel lama
 */

const meta = () => ({
  timestamp: new Date().toISOString(),
  version: '1.0',
});

const success = (res, { message = 'Success', data = null, code = 200, pagination = null } = {}) => {
  const body = {
    code,
    status: 'success',
    message,
    data,
    meta: meta(),
  };
  if (pagination) body.pagination = pagination;
  return res.status(code).json(body);
};

const error = (res, { message = 'Error', errors = null, code = 400 } = {}) => {
  return res.status(code).json({
    code,
    status: 'error',
    message,
    error: errors,
    meta: meta(),
  });
};

const notFound = (res, message = 'Data tidak ditemukan') => {
  return error(res, { message, code: 404 });
};

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, { message, code: 401 });
};

const forbidden = (res, message = 'Forbidden') => {
  return error(res, { message, code: 403 });
};

const validationError = (res, errors, message = 'Validation failed') => {
  return error(res, { message, errors, code: 422 });
};

const serverError = (res, message = 'Internal server error') => {
  return error(res, { message, code: 500 });
};

module.exports = { success, error, notFound, unauthorized, forbidden, validationError, serverError };

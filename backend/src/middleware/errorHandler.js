'use strict';
const { serverError } = require('../helpers/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
    return res.status(422).json({
      code: 422,
      status: 'error',
      message: 'Validation error',
      error: errors,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  }

  // Sequelize foreign key / general DB error
  if (err.name && err.name.startsWith('Sequelize')) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      message: err.message,
      error: null,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  }

  return serverError(res, err.message || 'Internal server error');
};

module.exports = errorHandler;

'use strict';

class AppError extends Error {
  constructor(message, code = 400, errors = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.errors = errors;
  }
}

module.exports = AppError;

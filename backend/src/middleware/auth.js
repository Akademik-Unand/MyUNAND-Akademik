'use strict';

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { unauthorized, forbidden } = require('../helpers/response');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.');
    }

    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, jwtConfig.secret);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token sudah kadaluarsa. Silakan login ulang.');
    }
    return unauthorized(res, 'Token tidak valid.');
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return unauthorized(res, 'Unauthorized.');
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return forbidden(res, `Akses ditolak. Hanya role [${roles.join(', ')}] yang diizinkan.`);
  }
  return next();
};

module.exports = { authenticate, authorize };

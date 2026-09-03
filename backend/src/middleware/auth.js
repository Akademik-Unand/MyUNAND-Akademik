'use strict';
const jwt = require('jsonwebtoken');
const { unauthorized } = require('../helpers/response');

/**
 * Middleware: verifikasi JWT token dari header Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token sudah kadaluarsa. Silakan login ulang.');
    }
    return unauthorized(res, 'Token tidak valid.');
  }
};

/**
 * Middleware: cek role user (admin, superadmin, dll)
 * @param  {...string} roles - daftar role yang diizinkan
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, 'Unauthorized.');
    }
    if (roles.length && !roles.includes(req.user.role)) {
      const { forbidden } = require('../helpers/response');
      return forbidden(res, `Akses ditolak. Hanya role [${roles.join(', ')}] yang diizinkan.`);
    }
    next();
  };
};

module.exports = { authenticate, authorize };

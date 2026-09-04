'use strict';

const { forbidden, unauthorized } = require('../helpers/response');

const checkPermission = (action, subject) => (req, res, next) => {
  if (!req.user) {
    return unauthorized(res, 'Unauthorized.');
  }
  if (!req.ability || !req.ability.can(action, subject)) {
    return forbidden(res, 'Akses ditolak');
  }
  return next();
};

module.exports = checkPermission;

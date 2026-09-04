'use strict';

module.exports = {
  secret: process.env.JWT_SECRET || 'jwt_secret_myunand_kurikulum_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '20m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

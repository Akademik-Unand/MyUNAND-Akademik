'use strict';

const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  port: Number(process.env.PORT) || 3000,
  url: process.env.APP_URL || 'http://localhost:3000',
  isProduction: env === 'production',
  isTest: env === 'test',
};

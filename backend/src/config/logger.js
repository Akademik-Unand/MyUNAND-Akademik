'use strict';

const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
  pretty: env !== 'production',
};

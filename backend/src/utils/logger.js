'use strict';

const pino = require('pino');
const loggerConfig = require('../config/logger');

const logger = pino({
  level: loggerConfig.level,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'body.password',
    ],
    remove: true,
  },
  ...(loggerConfig.pretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

module.exports = logger;

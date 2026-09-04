'use strict';

const appConfig = require('./app');

const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  origin: appConfig.isProduction
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin tidak diizinkan oleh CORS'));
      }
    : allowedOrigins.length === 1
      ? allowedOrigins[0]
      : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

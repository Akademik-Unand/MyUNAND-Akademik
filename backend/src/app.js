'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const corsConfig = require('./config/cors');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const activityLog = require('./middleware/activityLog');
const errorHandler = require('./middleware/errorHandler');
const { success, notFound } = require('./helpers/response');

const app = express();
app.set('query parser', 'extended');

app.use(helmet());
app.use(requestLogger);
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(activityLog);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    status: 'error',
    message: 'Terlalu banyak percobaan. Coba lagi nanti.',
    error: null,
    meta: { timestamp: new Date().toISOString(), version: '1.0' },
  },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', routes);

app.get('/up', (req, res) => {
  return success(res, { message: 'ok', data: { status: 'ok' } });
});

app.use((req, res) => {
  return notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
});

app.use(errorHandler);

module.exports = app;

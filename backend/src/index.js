'use strict';

require('dotenv').config();
const app = require('./app');
const appConfig = require('./config/app');
const { connectRedis } = require('./config/redis');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

async function boot() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.fatal({ err: error }, 'Unable to connect to database');
    process.exit(1);
  }

  const redisReady = await connectRedis();
  if (redisReady) {
    logger.info('Redis connected successfully');
  } else {
    logger.warn('Redis tidak tersedia; cache dinonaktifkan');
  }

  app.listen(appConfig.port, '0.0.0.0', () => {
    logger.info({ port: appConfig.port }, `Server running on http://localhost:${appConfig.port}`);
  });
}

boot();

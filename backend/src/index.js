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

  if (process.env.PENJADWALAN_INLINE_WORKER !== 'false') {
    const { tick } = require('./services/penjadwalan/worker.service');
    const { pollMs } = require('./config/penjadwalan');
    let runningTick = false;
    setInterval(async () => {
      if (runningTick) return;
      runningTick = true;
      try {
        await tick();
      } catch (err) {
        logger.error({ err }, 'Antrean penjadwalan gagal');
      } finally {
        runningTick = false;
      }
    }, pollMs).unref();
    logger.info('Worker penjadwalan terintegrasi aktif');
  }
}

boot();

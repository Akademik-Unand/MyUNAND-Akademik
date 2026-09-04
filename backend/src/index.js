'use strict';

require('dotenv').config();
const app = require('./app');
const appConfig = require('./config/app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

async function boot() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');
    app.listen(appConfig.port, () => {
      logger.info({ port: appConfig.port }, `Server running on http://localhost:${appConfig.port}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Unable to connect to database');
    process.exit(1);
  }
}

boot();

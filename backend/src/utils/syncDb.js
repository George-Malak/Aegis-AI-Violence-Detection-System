const { sequelize, connectDB } = require('../config/database');
require('../models');
const logger = require('../core/utils/logger');

async function run() {
  await connectDB();
  await sequelize.sync({ alter: true });
  logger.info('Database schema synced.');
  process.exit(0);
}

run().catch((err) => {
  logger.error('Sync failed:', err);
  process.exit(1);
});

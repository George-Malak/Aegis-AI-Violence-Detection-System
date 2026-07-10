const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../core/utils/logger');

let sequelize;

if (env.db.dialect === 'sqlite') {
  const storagePath = path.isAbsolute(env.db.storage) ? env.db.storage : path.join(process.cwd(), env.db.storage);
  const dir = path.dirname(storagePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: env.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
  });
} else {
  // postgres / mysql — install the matching driver first (`pg pg-hstore` or `mysql2`)
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: env.db.dialect,
    logging: env.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
  });
}

async function connectDB() {
  try {
    await sequelize.authenticate();
    logger.info(`[db] Connected via Sequelize (${env.db.dialect})`);
  } catch (err) {
    logger.error('[db] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };

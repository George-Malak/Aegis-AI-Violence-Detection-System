const http = require('http');
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB, sequelize } = require('./src/config/database');
require('./src/models'); 
const { initSocket } = require('./src/sockets');
const logger = require('./src/core/utils/logger');

async function start() {
  await connectDB();
  // `alter: true` keeps schema in sync with model definitions in dev without a full migration setup.
  await sequelize.sync({ alter: env.nodeEnv !== 'production' });

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    logger.info(`Agesis backend running on http://localhost:${env.port}${env.apiPrefix} [${env.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    logger.warn(`${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

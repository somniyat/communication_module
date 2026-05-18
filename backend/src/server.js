const app = require('./app');
const config = require('./config');
const db = require('./config/db');
const scheduler = require('./jobs/scheduler');
const logger = require('./utils/logger');

let server;

async function start() {
  await db.connect();

  server = app.listen(config.port, () => {
    logger.info(`HTTP server listening on :${config.port} (env=${config.env})`);
  });

  scheduler.start();

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down...`);
    scheduler.stop();
    if (server) await new Promise((r) => server.close(r));
    await db.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});

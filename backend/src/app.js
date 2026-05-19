const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./utils/logger');
const apiRouter = require('./api/router');
const { notFoundApi, errorHandler } = require('./api/middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isProd ? 'combined' : 'dev'));

// --- API ---
app.use('/api', apiRouter);
app.use('/api', notFoundApi); // 404 for unknown /api/*

// --- Static client ---
// Serve the React build when backend/client/index.html exists (typically after
// `npm run build` at the repo root). SERVE_CLIENT=false explicitly opts out.
const clientDir = path.join(__dirname, '..', 'client');
const clientIndex = path.join(clientDir, 'index.html');
const optOut = process.env.SERVE_CLIENT === 'false' || process.env.SERVE_CLIENT === '0';
const shouldServeClient = !optOut && fs.existsSync(clientIndex);

if (shouldServeClient) {
  logger.info(`Serving static client from ${clientDir}`);
  app.use(express.static(clientDir));
  app.get(/^(?!\/api(\/|$)).*/, (req, res, next) => {
    res.sendFile(clientIndex, (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      service: 'communication-module',
      api: '/api',
      hint: 'No client build found at backend/client/. Run `npm run build` at the repo root, or start the React dev server (npm --prefix frontend run dev) which proxies /api to this server.',
    });
  });
}

app.use(errorHandler);

module.exports = app;

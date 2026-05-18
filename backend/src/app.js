const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
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

// --- Static client (production / SERVE_CLIENT=true) ---
const shouldServeClient = config.isProd || config.serveClient;
if (shouldServeClient) {
  const clientDir = path.join(__dirname, '..', 'client');
  app.use(express.static(clientDir));
  // SPA fallback: any non-/api route serves index.html
  app.get(/^(?!\/api(\/|$)).*/, (req, res, next) => {
    res.sendFile(path.join(clientDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  // In dev, give a friendly hint at the root
  app.get('/', (req, res) => {
    res.json({
      service: 'communication-module',
      api: '/api',
      hint: 'Run the React dev server (npm --prefix frontend run dev) — Vite proxies /api to this server.',
    });
  });
}

app.use(errorHandler);

module.exports = app;

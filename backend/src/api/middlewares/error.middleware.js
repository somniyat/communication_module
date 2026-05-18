const logger = require('../../utils/logger');
const { HttpError } = require('../../utils/errors');

function notFoundApi(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', details: err.keyValue });
  }
  logger.error(err && err.stack ? err.stack : err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundApi, errorHandler };

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

async function connect() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = { connect, disconnect, mongoose };

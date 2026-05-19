const path = require('path');
// Load backend/.env regardless of which directory the process was started in.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const toBool = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/communication_module',

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  job: {
    intervalMs: parseInt(process.env.JOB_INTERVAL_MS, 10) || 1000,
    enabled: toBool(process.env.JOB_ENABLED, true),
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: toBool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    rejectUnauthorized: toBool(process.env.SMTP_REJECT_UNAUTHORIZED, true),
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    smsFrom: process.env.TWILIO_SMS_FROM || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
  },

  serveClient: toBool(process.env.SERVE_CLIENT, false),
};

config.isProd = config.env === 'production';

module.exports = config;

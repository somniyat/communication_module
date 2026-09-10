const nodemailer = require('nodemailer');
const BaseModule = require('../BaseModule');
const config = require('../../config');
const logger = require('../../utils/logger');

class MailModule extends BaseModule {
  constructor() {
    super('MailModule');
    this._transporters = new Map(); // fingerprint → transporter
  }

  _resolveSmtp(customer) {
    const c = customer && customer.smtp;
    if (c && c.host) return { host: c.host, port: c.port || 587, secure: !!c.secure, user: c.user || '', pass: c.pass || '', rejectUnauthorized: c.rejectUnauthorized !== false };
    return config.smtp;
  }

  getTransporter(customer) {
    const smtp = this._resolveSmtp(customer);
    const fp = `${smtp.host}:${smtp.port}:${smtp.user}`;
    if (this._transporters.has(fp)) return { transporter: this._transporters.get(fp), smtp };
    if (!smtp.host) {
      logger.warn('MailModule: SMTP not configured, using JSON transport (no real email sent)');
      const t = nodemailer.createTransport({ jsonTransport: true });
      this._transporters.set(fp, t);
      return { transporter: t, smtp };
    }
    const t = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
      tls: { rejectUnauthorized: smtp.rejectUnauthorized },
    });
    if (!smtp.rejectUnauthorized) logger.warn('MailModule: TLS certificate validation is DISABLED');
    this._transporters.set(fp, t);
    return { transporter: t, smtp };
  }

  resolveRecipients(communication, customer) {
    if (communication.email) return [communication.email];
    if (customer && Array.isArray(customer.defaultRecipientEmails) && customer.defaultRecipientEmails.length) {
      return customer.defaultRecipientEmails;
    }
    return [];
  }

  async send(communication, customer) {
    const to = this.resolveRecipients(communication, customer);
    if (!to.length) return this.fail('No recipient email available');

    try {
      const { transporter, smtp } = this.getTransporter(customer);
      const from = (customer && customer.noReplyEmail) || smtp.user || 'no-reply@example.com';

      const rawFiles = communication.files;
      const filesArray = Array.isArray(rawFiles)
        ? rawFiles
        : typeof rawFiles === 'string' && rawFiles.trim()
          ? [rawFiles]
          : [];

      const info = await transporter.sendMail({
        from,
        to,
        subject: communication.subject || 'Notification',
        html: communication.html || communication.message || '',
        attachments: filesArray.map((f) => (typeof f === 'string' ? { path: f } : f)),
      });

      const dryRun = !smtp.host;
      logger.debug(`MailModule${dryRun ? '(dry-run)' : ''}: sent to=${to.join(',')} id=${info.messageId || 'n/a'}`);
      return this.ok({ dryRun });
    } catch (err) {
      const detail = err.responseCode
        ? `${err.responseCode} ${err.response || err.message}`
        : err.message || String(err);
      logger.error(`MailModule: send failed to=${to.join(',')} — ${detail}`);
      return this.fail(detail || 'Unknown SMTP error');
    }
  }
}

module.exports = MailModule;

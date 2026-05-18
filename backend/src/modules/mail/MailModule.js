const nodemailer = require('nodemailer');
const BaseModule = require('../BaseModule');
const config = require('../../config');
const logger = require('../../utils/logger');

class MailModule extends BaseModule {
  constructor() {
    super('MailModule');
    this.transporter = null;
  }

  getTransporter() {
    if (this.transporter) return this.transporter;
    if (!config.smtp.host) {
      logger.warn('MailModule: SMTP not configured, using JSON transport (no real email sent)');
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      return this.transporter;
    }
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      tls: { rejectUnauthorized: config.smtp.rejectUnauthorized },
    });
    if (!config.smtp.rejectUnauthorized) {
      logger.warn('MailModule: TLS certificate validation is DISABLED (SMTP_REJECT_UNAUTHORIZED=false)');
    }
    return this.transporter;
  }

  resolveRecipients(communication, customer) {
    if (communication.email) return [communication.email];
    if (customer && Array.isArray(customer.defaultRecipientEmails) && customer.defaultRecipientEmails.length) {
      return customer.defaultRecipientEmails;
    }
    return [];
  }

  async send(communication, customer) {
    try {
      const to = this.resolveRecipients(communication, customer);
      if (!to.length) return this.fail('No recipient email available');

      const from = (customer && customer.noReplyEmail) || config.smtp.user || 'no-reply@example.com';

      const info = await this.getTransporter().sendMail({
        from,
        to,
        subject: communication.subject || 'Notification',
        text: communication.message,
        html: communication.html || undefined,
        attachments: (communication.files || []).map((f) =>
          typeof f === 'string' ? { path: f } : f
        ),
      });

      const dryRun = !config.smtp.host;
      logger.debug(`MailModule${dryRun ? '(dry-run)' : ''}: sent to=${to.join(',')} id=${info.messageId || 'n/a'}`);
      return this.ok({ dryRun });
    } catch (err) {
      return this.fail(err);
    }
  }
}

module.exports = MailModule;

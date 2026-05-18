const BaseModule = require('../BaseModule');
const config = require('../../config');
const logger = require('../../utils/logger');

class SmsModule extends BaseModule {
  constructor() {
    super('SmsModule');
    this.client = null;
  }

  getClient() {
    if (this.client !== null) return this.client;
    if (!config.twilio.accountSid || !config.twilio.authToken) {
      logger.warn('SmsModule: Twilio not configured, messages will be logged only');
      this.client = false;
      return this.client;
    }
    // Lazy require so the package only loads when configured
    // eslint-disable-next-line global-require
    const twilio = require('twilio');
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    return this.client;
  }

  async send(communication, customer) {
    try {
      const to = communication.phoneNumber;
      if (!to) return this.fail('No recipient phone number');

      const from = (customer && customer.smsSenderId) || config.twilio.smsFrom;
      if (!from) return this.fail('No SMS sender configured');

      const client = this.getClient();
      if (!client) {
        logger.info(`SmsModule(dry-run): to=${to} from=${from} message="${communication.message}"`);
        return this.ok();
      }

      const res = await client.messages.create({ to, from, body: communication.message });
      logger.debug(`SmsModule: sent sid=${res.sid}`);
      return this.ok();
    } catch (err) {
      return this.fail(err);
    }
  }
}

module.exports = SmsModule;

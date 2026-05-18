const BaseModule = require('../BaseModule');
const config = require('../../config');
const logger = require('../../utils/logger');

const formatWhatsapp = (n) => (n && n.startsWith('whatsapp:') ? n : `whatsapp:${n}`);

class WhatsappModule extends BaseModule {
  constructor() {
    super('WhatsappModule');
    this.client = null;
  }

  getClient() {
    if (this.client !== null) return this.client;
    if (!config.twilio.accountSid || !config.twilio.authToken) {
      logger.warn('WhatsappModule: Twilio not configured, messages will be logged only');
      this.client = false;
      return this.client;
    }
    // eslint-disable-next-line global-require
    const twilio = require('twilio');
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    return this.client;
  }

  async send(communication, customer) {
    try {
      const to = communication.phoneNumber;
      if (!to) return this.fail('No recipient phone number');

      const from = (customer && customer.whatsappSenderPhone) || config.twilio.whatsappFrom;
      if (!from) return this.fail('No WhatsApp sender configured');

      const client = this.getClient();
      if (!client) {
        logger.info(`WhatsappModule(dry-run): to=${to} from=${from} message="${communication.message}"`);
        return this.ok();
      }

      const mediaUrls = Array.isArray(communication.files)
        ? communication.files.filter((f) => typeof f === 'string' && /^https?:\/\//.test(f))
        : [];

      const res = await client.messages.create({
        to: formatWhatsapp(to),
        from: formatWhatsapp(from),
        body: communication.message,
        mediaUrl: mediaUrls.length ? mediaUrls : undefined,
      });
      logger.debug(`WhatsappModule: sent sid=${res.sid}`);
      return this.ok();
    } catch (err) {
      return this.fail(err);
    }
  }
}

module.exports = WhatsappModule;

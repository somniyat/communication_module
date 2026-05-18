const MailModule = require('../modules/mail/MailModule');
const SmsModule = require('../modules/sms/SmsModule');
const WhatsappModule = require('../modules/whatsapp/WhatsappModule');
const NotificationModule = require('../modules/notification/NotificationModule');
const UserModule = require('../modules/user/UserModule');

const COMMUNICATION_TYPES = ['email', 'sms', 'whatsapp', 'notification', 'user'];

class DispatcherService {
  constructor() {
    this.modules = {
      email: new MailModule(),
      sms: new SmsModule(),
      whatsapp: new WhatsappModule(),
      notification: new NotificationModule(),
      user: new UserModule(),
    };
  }

  getModule(type) {
    return this.modules[type] || null;
  }

  async dispatch(communication, customer) {
    const mod = this.getModule(communication.type);
    if (!mod) {
      return { success: false, error: `Unsupported communication type: ${communication.type}` };
    }
    return mod.send(communication, customer);
  }
}

const instance = new DispatcherService();
module.exports = instance;
module.exports.DispatcherService = DispatcherService;
module.exports.COMMUNICATION_TYPES = COMMUNICATION_TYPES;

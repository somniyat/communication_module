const BaseModule = require('../BaseModule');
const logger = require('../../utils/logger');

class NotificationModule extends BaseModule {
  constructor() {
    super('NotificationModule');
    this.apps = new Map(); // customerId -> firebase-admin App
  }

  getApp(customer) {
    if (!customer || !customer.firebaseKey) return null;
    const id = String(customer._id || customer.id || customer.name);
    if (this.apps.has(id)) return this.apps.get(id);

    let credentials = customer.firebaseKey;
    if (typeof credentials === 'string') {
      try {
        credentials = JSON.parse(credentials);
      } catch (e) {
        logger.error(`NotificationModule: invalid firebaseKey JSON for customer=${id}`);
        return null;
      }
    }

    // eslint-disable-next-line global-require
    const admin = require('firebase-admin');
    const appName = `customer-${id}`;
    const existing = admin.apps.find((a) => a && a.name === appName);
    const app = existing || admin.initializeApp({ credential: admin.credential.cert(credentials) }, appName);
    this.apps.set(id, app);
    return app;
  }

  async send(communication, customer) {
    try {
      const token = communication.fcmToken;
      if (!token) return this.fail('No FCM token');

      const app = this.getApp(customer);
      if (!app) {
        logger.info(`NotificationModule(dry-run): token=${token} message="${communication.message}"`);
        return this.ok();
      }

      // eslint-disable-next-line global-require
      const admin = require('firebase-admin');
      const messaging = admin.messaging(app);
      const res = await messaging.send({
        token,
        notification: {
          title: communication.subject || 'Notification',
          body: communication.message,
        },
        data: communication.data && typeof communication.data === 'object'
          ? Object.fromEntries(Object.entries(communication.data).map(([k, v]) => [k, String(v)]))
          : undefined,
      });
      logger.debug(`NotificationModule: sent id=${res}`);
      return this.ok();
    } catch (err) {
      return this.fail(err);
    }
  }
}

module.exports = NotificationModule;

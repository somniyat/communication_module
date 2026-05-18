const crypto = require('crypto');
const BaseModule = require('../BaseModule');
const logger = require('../../utils/logger');

function fingerprint(creds) {
  const stable = JSON.stringify(creds, Object.keys(creds).sort());
  return crypto.createHash('sha256').update(stable).digest('hex');
}

class NotificationModule extends BaseModule {
  constructor() {
    super('NotificationModule');
    this.apps = new Map(); // customerId -> { app, fingerprint }
  }

  parseCredentials(raw, customerId) {
    let credentials = raw;
    if (typeof credentials === 'string') {
      try {
        credentials = JSON.parse(credentials);
      } catch (e) {
        logger.error(`NotificationModule: invalid firebaseKey JSON for customer=${customerId}`);
        return null;
      }
    }
    if (!credentials || typeof credentials !== 'object') return null;
    return credentials;
  }

  async dropApp(id) {
    const entry = this.apps.get(id);
    if (!entry) return;
    this.apps.delete(id);
    try {
      await entry.app.delete();
    } catch (err) {
      logger.warn(`NotificationModule: failed to dispose app customer=${id}: ${err.message}`);
    }
  }

  getApp(customer) {
    if (!customer || !customer.firebaseKey) return null;
    const id = String(customer.id || customer._id || customer.name);

    const credentials = this.parseCredentials(customer.firebaseKey, id);
    if (!credentials) return null;

    const fp = fingerprint(credentials);
    const cached = this.apps.get(id);
    if (cached && cached.fingerprint === fp) return cached.app;

    if (cached) {
      // Credentials changed since last init; tear down the stale app.
      this.apps.delete(id);
      cached.app.delete().catch((err) =>
        logger.warn(`NotificationModule: failed to dispose stale app customer=${id}: ${err.message}`)
      );
      logger.info(`NotificationModule: firebaseKey changed for customer=${id}, re-initializing`);
    }

    // eslint-disable-next-line global-require
    const admin = require('firebase-admin');
    const appName = `customer-${id}-${fp.slice(0, 8)}`;
    const existing = admin.apps.find((a) => a && a.name === appName);
    const app = existing || admin.initializeApp({ credential: admin.credential.cert(credentials) }, appName);
    this.apps.set(id, { app, fingerprint: fp });
    return app;
  }

  async send(communication, customer) {
    try {
      const token = communication.fcmToken;
      if (!token) return this.fail('No FCM token');

      const app = this.getApp(customer);
      if (!app) {
        logger.info(`NotificationModule(dry-run): token=${token} message="${communication.message}"`);
        return this.ok({ dryRun: true });
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

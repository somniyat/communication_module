const BaseModule = require('../BaseModule');
const logger = require('../../utils/logger');

/**
 * In-app delivery: nothing to send externally — the message stays in the
 * communication collection and is consumed by the target application
 * (via the update API or by reading communications directly).
 */
class UserModule extends BaseModule {
  constructor() {
    super('UserModule');
  }

  async send(communication /* , customer */) {
    try {
      logger.debug(`UserModule: stored in-app message comID=${communication.comID}`);
      return this.ok();
    } catch (err) {
      return this.fail(err);
    }
  }
}

module.exports = UserModule;

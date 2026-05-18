const dispatcher = require('../dispatcher/DispatcherService');
const communicationService = require('../resources/communication/communication.service');
const { callApi } = require('../utils/httpClient');
const logger = require('../utils/logger');

class CommunicationJob {
  constructor({ dispatcherService = dispatcher, commService = communicationService } = {}) {
    this.dispatcher = dispatcherService;
    this.commService = commService;
  }

  /**
   * Run one tick for a single customer:
   * 1. fetch communications from customer.communicationFetchApi
   * 2. upsert them (by comID)
   * 3. dispatch every pending one
   * 4. POST result back to customer.communicationUpdateApi (if set)
   */
  async runForCustomer(customer) {
    if (!customer || !customer.active) return { skipped: true };

    let fetched = [];
    try {
      fetched = await this.fetchCommunications(customer);
    } catch (err) {
      logger.error(`Job: fetch failed for customer=${customer.name}: ${err.message}`);
      return { fetched: 0, dispatched: 0, errors: [err.message] };
    }

    if (fetched.length) {
      await this.commService.upsertMany(customer.id, fetched);
    }

    const pending = await this.commService.listPendingForCustomer(customer.id, 100);
    let dispatched = 0;
    let failed = 0;

    for (const comm of pending) {
      const result = await this.dispatcher.dispatch(comm, customer);
      let saved;
      if (result.success) {
        saved = await this.commService.markSent(comm.id, { dryRun: !!result.dryRun });
        dispatched += 1;
      } else {
        saved = await this.commService.markFailed(comm.id, result.error);
        failed += 1;
      }

      await this.notifyUpdate(customer, saved, result);
    }

    return { fetched: fetched.length, dispatched, failed };
  }

  async fetchCommunications(customer) {
    const api = customer.communicationFetchApi || {};
    if (!api.url) return [];
    const data = await callApi({
      url: api.url,
      method: api.method || 'GET',
      headers: api.headers || {},
    });
    // Accept either an array directly, or { data: [...] }, or { items: [...] }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data && data.data)) return data.data;
    if (Array.isArray(data && data.items)) return data.items;
    return [];
  }

  async notifyUpdate(customer, communication, result) {
    const api = customer.communicationUpdateApi || {};
    if (!api.url || !communication) return;
    try {
      await callApi({
        url: api.url,
        method: api.method || 'POST',
        headers: api.headers || {},
        data: {
          id: communication.comID,
          isSent: result.success ? 1 : 0,
          error: result.success ? '' : (result.error || ''),
        },
      });
      await this.commService.markUpdateAck(communication.id);
    } catch (err) {
      logger.warn(`Job: update API call failed for customer=${customer.name} comID=${communication.comID}: ${err.message}`);
    }
  }
}

module.exports = CommunicationJob;

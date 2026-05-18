const config = require('../config');
const logger = require('../utils/logger');
const customerService = require('../resources/customer/customer.service');
const CommunicationJob = require('./CommunicationJob');

class Scheduler {
  constructor() {
    this.job = new CommunicationJob();
    this.timers = new Map(); // customerId -> { interval, timer, running }
    this.refreshTimer = null;
    this.refreshIntervalMs = 30_000; // re-scan customers every 30s to pick up config changes
  }

  start() {
    if (!config.job.enabled) {
      logger.info('Scheduler: disabled by config (JOB_ENABLED=false)');
      return;
    }
    logger.info(`Scheduler: starting (default interval ${config.job.intervalMs}ms)`);
    this.refresh();
    this.refreshTimer = setInterval(() => this.refresh().catch((e) => logger.error(e)), this.refreshIntervalMs);
  }

  stop() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
    for (const [, entry] of this.timers) clearInterval(entry.timer);
    this.timers.clear();
    logger.info('Scheduler: stopped');
  }

  async refresh() {
    const customers = await customerService.listActiveRaw();
    const activeIds = new Set(customers.map((c) => String(c._id)));

    // Remove timers for customers that disappeared or went inactive
    for (const [id, entry] of this.timers) {
      if (!activeIds.has(id)) {
        clearInterval(entry.timer);
        this.timers.delete(id);
        logger.info(`Scheduler: removed timer for customer=${id}`);
      }
    }

    // Add or update timers
    for (const customer of customers) {
      const id = String(customer._id);
      const intervalMs = customer.jobIntervalMs || config.job.intervalMs;
      const existing = this.timers.get(id);
      if (existing && existing.interval === intervalMs) continue;
      if (existing) clearInterval(existing.timer);

      const entry = { interval: intervalMs, running: false, timer: null };
      entry.timer = setInterval(() => this.tick(id, entry), intervalMs);
      this.timers.set(id, entry);
      logger.info(`Scheduler: customer=${customer.name} interval=${intervalMs}ms`);
    }
  }

  async tick(customerId, entry) {
    if (entry.running) return; // skip overlap
    entry.running = true;
    try {
      const customer = await customerService.findByIdRaw(customerId);
      if (!customer || !customer.active) return;
      const result = await this.job.runForCustomer(customer);
      if (result && (result.fetched || result.dispatched || result.failed)) {
        logger.debug(`Scheduler: ${customer.name} fetched=${result.fetched} sent=${result.dispatched} failed=${result.failed}`);
      }
    } catch (err) {
      logger.error(`Scheduler tick error for customer=${customerId}: ${err.message}`);
    } finally {
      entry.running = false;
    }
  }
}

module.exports = new Scheduler();
module.exports.Scheduler = Scheduler;

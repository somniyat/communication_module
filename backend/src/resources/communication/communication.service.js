const Communication = require('./communication.model');
const { notFound, badRequest } = require('../../utils/errors');

const isTruthy = (v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
  return false;
};

// Map known alias fields (from client fetch APIs) to our schema.
function normalizeIncoming(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const out = { ...raw };
  if (!out.fcmToken && (raw.fcmtoken || raw.token)) {
    out.fcmToken = raw.fcmtoken || raw.token;
  }
  if (!out.phoneNumber && (raw.phone || raw.phonenumber)) {
    out.phoneNumber = raw.phone || raw.phonenumber;
  }
  if (raw.without_notification_body !== undefined || raw.withoutNotificationBody !== undefined) {
    out.withoutNotificationBody = isTruthy(
      raw.withoutNotificationBody !== undefined ? raw.withoutNotificationBody : raw.without_notification_body
    );
  }
  delete out.fcmtoken;
  delete out.token;
  delete out.phone;
  delete out.phonenumber;
  delete out.without_notification_body;
  return out;
}

class CommunicationService {
  async addMany(customerId, items) {
    if (!Array.isArray(items)) throw badRequest('items must be an array');
    return this.upsertMany(customerId, items);
  }

  /**
   * Upsert by (customerId, comID). customerId is the customer's readable id
   * (e.g. "cus_abc..."). Returns each saved document plus whether it was newly inserted.
   */
  async upsertMany(customerId, items) {
    const results = [];
    for (const item of items) {
      const raw = normalizeIncoming(item);
      if (!raw || !raw.comID) continue;
      const { comID, id: _ignoreId, _id: _ignoreUnderId, ...rest } = raw;
      // Preserve the original fetched object so downstream channels can forward it.
      rest.rawPayload = item;
      const update = { $set: { ...rest, customerId }, $setOnInsert: { comID } };
      if (rest.status === undefined) {
        update.$setOnInsert.status = 'pending';
      }
      const doc = await Communication.findOneAndUpdate(
        { customerId, comID },
        update,
        { new: true, upsert: true, setDefaultsOnInsert: true, includeResultMetadata: true }
      );
      const value = doc.value || doc;
      const wasInserted = !!(doc.lastErrorObject && doc.lastErrorObject.upserted);
      results.push({ doc: value, inserted: wasInserted });
    }
    return results;
  }

  async findByComID(customerId, comID) {
    return Communication.findOne({ customerId, comID });
  }

  async findById(id) {
    const doc = await Communication.findOne({ id });
    if (!doc) throw notFound('Communication not found');
    return doc;
  }

  async list({ customerId, status, type, comID, limit = 50, skip = 0 } = {}) {
    const query = {};
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    if (type) query.type = type;
    if (comID) query.comID = comID;
    const [items, total] = await Promise.all([
      Communication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Communication.countDocuments(query),
    ]);
    return { items, total, limit, skip };
  }

  async listPendingForCustomer(customerId, limit = 100) {
    return Communication.find({ customerId, status: 'pending' }).limit(limit);
  }

  async markSent(id, { dryRun = false } = {}) {
    return Communication.findOneAndUpdate(
      { id },
      { $set: { status: 'sent', error: '', sentAt: new Date(), dryRun: !!dryRun }, $inc: { attempts: 1 } },
      { new: true }
    );
  }

  async markFailed(id, errorMessage) {
    return Communication.findOneAndUpdate(
      { id },
      { $set: { status: 'notsent', error: errorMessage || 'Unknown error' }, $inc: { attempts: 1 } },
      { new: true }
    );
  }

  async markUpdateAck(id) {
    return Communication.findOneAndUpdate({ id }, { $set: { updateAckAt: new Date() } }, { new: true });
  }

  async remove(id) {
    const removed = await Communication.findOneAndDelete({ id });
    if (!removed) throw notFound('Communication not found');
    return removed;
  }

  async removeMany(ids) {
    if (!Array.isArray(ids) || !ids.length) return { deletedCount: 0 };
    const res = await Communication.deleteMany({ id: { $in: ids } });
    return { deletedCount: res.deletedCount || 0 };
  }

  // Deletes all communications matching the provided filter (same shape as list()).
  async removeByFilter({ customerId, status, type, comID } = {}) {
    const query = {};
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    if (type) query.type = type;
    if (comID) query.comID = comID;
    const res = await Communication.deleteMany(query);
    return { deletedCount: res.deletedCount || 0 };
  }

  async stats({ customerId } = {}) {
    const match = customerId ? { customerId } : {};
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { status: '$status', type: '$type' },
          count: { $sum: 1 },
        },
      },
    ];
    return Communication.aggregate(pipeline);
  }
}

module.exports = new CommunicationService();
module.exports.CommunicationService = CommunicationService;

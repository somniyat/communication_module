const { prefixedId } = require('./ids');
const logger = require('./logger');

const User = require('../resources/user/user.model');
const Customer = require('../resources/customer/customer.model');
const Communication = require('../resources/communication/communication.model');

async function backfillId(model, prefix) {
  const docs = await model.collection
    .find({ $or: [{ id: { $exists: false } }, { id: null }, { id: '' }] })
    .project({ _id: 1 })
    .toArray();
  for (const doc of docs) {
    await model.collection.updateOne({ _id: doc._id }, { $set: { id: prefixedId(prefix) } });
  }
  return docs.length;
}

// Convert pre-existing communication.customerId (ObjectId) -> customer.id (string).
async function migrateCommunicationCustomerId() {
  const docs = await Communication.collection
    .find({ customerId: { $type: 'objectId' } })
    .project({ _id: 1, customerId: 1 })
    .toArray();
  if (!docs.length) return 0;

  const customers = await Customer.collection.find({}).project({ _id: 1, id: 1 }).toArray();
  const map = new Map(customers.map((c) => [String(c._id), c.id]));

  let migrated = 0;
  for (const doc of docs) {
    const newId = map.get(String(doc.customerId));
    if (newId) {
      await Communication.collection.updateOne({ _id: doc._id }, { $set: { customerId: newId } });
      migrated += 1;
    }
  }
  return migrated;
}

async function ensureIds() {
  const u = await backfillId(User, 'usr');
  const c = await backfillId(Customer, 'cus');
  const co = await backfillId(Communication, 'com');
  const m = await migrateCommunicationCustomerId();
  if (u || c || co || m) {
    logger.info(
      `ensureIds: backfilled users=${u} customers=${c} communications=${co}, migrated communication.customerId=${m}`
    );
  }
}

module.exports = { ensureIds };

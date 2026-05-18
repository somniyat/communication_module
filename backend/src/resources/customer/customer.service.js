const Customer = require('./customer.model');
const { notFound } = require('../../utils/errors');

class CustomerService {
  async create(data) {
    return Customer.create(data);
  }

  async update(id, patch) {
    const updated = await Customer.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!updated) throw notFound('Customer not found');
    return updated;
  }

  async remove(id) {
    const removed = await Customer.findByIdAndDelete(id);
    if (!removed) throw notFound('Customer not found');
    return removed;
  }

  async findById(id) {
    const customer = await Customer.findById(id);
    if (!customer) throw notFound('Customer not found');
    return customer;
  }

  async findByApiKey(apiKey) {
    return Customer.findOne({ apiKey });
  }

  async list({ active } = {}) {
    const query = {};
    if (active !== undefined) query.active = active;
    return Customer.find(query).sort({ createdAt: -1 });
  }

  // Includes the raw firebaseKey — used by jobs/dispatcher, never returned via HTTP.
  async listActiveRaw() {
    return Customer.find({ active: true }).lean();
  }

  async findByIdRaw(id) {
    return Customer.findById(id).lean();
  }
}

module.exports = new CustomerService();
module.exports.CustomerService = CustomerService;

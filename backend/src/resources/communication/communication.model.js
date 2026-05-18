const mongoose = require('mongoose');
const { COMMUNICATION_TYPES } = require('../../dispatcher/DispatcherService');

const STATUSES = ['pending', 'sent', 'notsent'];

const communicationSchema = new mongoose.Schema(
  {
    comID: { type: String, required: true, trim: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },

    type: { type: String, enum: COMMUNICATION_TYPES, required: true },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    html: { type: String, default: '' },

    fcmToken: { type: String, default: '' },
    email: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },

    files: { type: [String], default: [] },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },

    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    error: { type: String, default: '' },

    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, default: null },
    updateAckAt: { type: Date, default: null },
  },
  { timestamps: true }
);

communicationSchema.index({ customerId: 1, comID: 1 }, { unique: true });
communicationSchema.index({ status: 1, type: 1 });

communicationSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('Communication', communicationSchema);
module.exports.STATUSES = STATUSES;
module.exports.TYPES = COMMUNICATION_TYPES;

const mongoose = require('mongoose');
const { COMMUNICATION_TYPES } = require('../../dispatcher/DispatcherService');
const { prefixedId } = require('../../utils/ids');

const STATUSES = ['pending', 'sent', 'notsent'];

const communicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true, default: () => prefixedId('com') },
    comID: { type: String, required: true, trim: true, index: true },
    customerId: { type: String, required: true, index: true }, // references Customer.id (readable)

    type: { type: String, enum: COMMUNICATION_TYPES, required: true },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    html: { type: String, default: '' },

    fcmToken: { type: String, default: '' },
    email: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },

    files: { type: [String], default: [] },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    rawPayload: { type: mongoose.Schema.Types.Mixed, default: {} },

    withoutNotificationBody: { type: Boolean, default: false },

    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    error: { type: String, default: '' },
    dryRun: { type: Boolean, default: false },

    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, default: null },
    updateAckAt: { type: Date, default: null },
  },
  { timestamps: true, id: false }
);

communicationSchema.index({ customerId: 1, comID: 1 }, { unique: true });
communicationSchema.index({ status: 1, type: 1 });

communicationSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('Communication', communicationSchema);
module.exports.STATUSES = STATUSES;
module.exports.TYPES = COMMUNICATION_TYPES;

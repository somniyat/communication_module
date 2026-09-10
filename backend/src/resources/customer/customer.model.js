const mongoose = require('mongoose');
const crypto = require('crypto');
const { prefixedId } = require('../../utils/ids');

const apiEndpointSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET' },
    headers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const smtpSchema = new mongoose.Schema(
  {
    host: { type: String, trim: true, default: '' },
    port: { type: Number, default: null },
    secure: { type: Boolean, default: false },
    user: { type: String, trim: true, default: '' },
    pass: { type: String, default: '' },
    rejectUnauthorized: { type: Boolean, default: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true, default: () => prefixedId('cus') },
    name: { type: String, required: true, trim: true, unique: true },
    apiKey: { type: String, required: true, unique: true, index: true },

    firebaseKey: { type: mongoose.Schema.Types.Mixed, default: null },
    smtp: { type: smtpSchema, default: () => ({}) },
    noReplyEmail: { type: String, trim: true, default: '' },
    defaultRecipientEmails: { type: [String], default: [] },
    whatsappSenderPhone: { type: String, trim: true, default: '' },
    smsSenderId: { type: String, trim: true, default: '' },

    // Default for push notifications: send data-only messages (no notification block)
    // when the per-communication field is not set.
    withoutNotificationBody: { type: Boolean, default: false },

    communicationFetchApi: { type: apiEndpointSchema, default: () => ({}) },
    communicationUpdateApi: { type: apiEndpointSchema, default: () => ({}) },

    jobIntervalMs: { type: Number, default: null },
    active: { type: Boolean, default: true },

    notes: { type: String, default: '' },
  },
  { timestamps: true, id: false }
);

customerSchema.pre('validate', function preValidate(next) {
  if (!this.apiKey) this.apiKey = crypto.randomBytes(24).toString('hex');
  next();
});

customerSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj._id;
  obj.hasFirebaseKey = !!obj.firebaseKey;
  delete obj.firebaseKey;
  if (obj.smtp) {
    obj.smtp = { host: obj.smtp.host, port: obj.smtp.port, secure: obj.smtp.secure, user: obj.smtp.user, rejectUnauthorized: obj.smtp.rejectUnauthorized, hasPass: !!obj.smtp.pass };
  }
  return obj;
};

module.exports = mongoose.model('Customer', customerSchema);

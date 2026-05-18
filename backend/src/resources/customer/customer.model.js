const mongoose = require('mongoose');
const crypto = require('crypto');

const apiEndpointSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET' },
    headers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    apiKey: { type: String, required: true, unique: true, index: true },

    firebaseKey: { type: mongoose.Schema.Types.Mixed, default: null },
    noReplyEmail: { type: String, trim: true, default: '' },
    defaultRecipientEmails: { type: [String], default: [] },
    whatsappSenderPhone: { type: String, trim: true, default: '' },
    smsSenderId: { type: String, trim: true, default: '' },

    communicationFetchApi: { type: apiEndpointSchema, default: () => ({}) },
    communicationUpdateApi: { type: apiEndpointSchema, default: () => ({}) },

    jobIntervalMs: { type: Number, default: null }, // null = use global default
    active: { type: Boolean, default: true },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

customerSchema.pre('validate', function preValidate(next) {
  if (!this.apiKey) this.apiKey = crypto.randomBytes(24).toString('hex');
  next();
});

customerSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  obj.id = obj._id;
  delete obj._id;
  // hide firebase credentials in API responses (keep only a flag)
  obj.hasFirebaseKey = !!obj.firebaseKey;
  delete obj.firebaseKey;
  return obj;
};

module.exports = mongoose.model('Customer', customerSchema);

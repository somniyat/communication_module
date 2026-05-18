const mongoose = require('mongoose');
const { prefixedId } = require('../../utils/ids');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true, default: () => prefixedId('usr') },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true, id: false }
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj._id;
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

const crypto = require('crypto');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomId(length = 10) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function prefixedId(prefix, length = 10) {
  return `${prefix}_${randomId(length)}`;
}

module.exports = { randomId, prefixedId };

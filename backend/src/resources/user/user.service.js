const bcrypt = require('bcryptjs');
const User = require('./user.model');
const { conflict, notFound } = require('../../utils/errors');

class UserService {
  async create({ email, password, name, role }) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw conflict('Email already registered');
    const passwordHash = await bcrypt.hash(password, 10);
    return User.create({ email, passwordHash, name, role });
  }

  async findById(id) {
    const user = await User.findOne({ id });
    if (!user) throw notFound('User not found');
    return user;
  }

  async findByEmail(email) {
    return User.findOne({ email: String(email).toLowerCase() });
  }

  async list() {
    return User.find().sort({ createdAt: -1 });
  }

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.passwordHash);
  }
}

module.exports = new UserService();
module.exports.UserService = UserService;

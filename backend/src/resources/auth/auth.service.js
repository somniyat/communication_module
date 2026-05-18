const jwt = require('jsonwebtoken');
const config = require('../../config');
const userService = require('../user/user.service');
const { unauthorized } = require('../../utils/errors');

class AuthService {
  signToken(user) {
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async register({ email, password, name }) {
    const user = await userService.create({ email, password, name, role: 'admin' });
    return { user, token: this.signToken(user) };
  }

  async login({ email, password }) {
    const user = await userService.findByEmail(email);
    if (!user) throw unauthorized('Invalid credentials');
    const ok = await userService.verifyPassword(user, password);
    if (!ok) throw unauthorized('Invalid credentials');
    return { user, token: this.signToken(user) };
  }

  async me(userId) {
    return userService.findById(userId);
  }
}

module.exports = new AuthService();
module.exports.AuthService = AuthService;

const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ data: { user, token } });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  res.json({ data: user });
});

module.exports = { register, login, me };

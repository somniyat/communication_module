const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const users = await userService.list();
  res.json({ data: users });
});

const getOne = asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  res.json({ data: user });
});

module.exports = { list, getOne };

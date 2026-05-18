const Joi = require('joi');

const listUsers = {};

const getUser = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

module.exports = { listUsers, getUser };

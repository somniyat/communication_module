const Joi = require('joi');

const listUsers = {};

const getUser = {
  params: Joi.object({ id: Joi.string().required() }),
};

module.exports = { listUsers, getUser };

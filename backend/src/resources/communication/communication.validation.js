const Joi = require('joi');
const { TYPES, STATUSES } = require('./communication.model');

const communicationBase = {
  comID: Joi.string().trim().required(),
  type: Joi.string().valid(...TYPES).required(),
  subject: Joi.string().allow(''),
  message: Joi.string().allow(''),
  html: Joi.string().allow(''),
  fcmToken: Joi.string().allow(''),
  email: Joi.string().email().allow(''),
  phoneNumber: Joi.string().allow(''),
  files: Joi.array().items(Joi.string()).default([]),
  data: Joi.object().default({}),
  status: Joi.string().valid(...STATUSES),
  error: Joi.string().allow(''),
};

const addMany = {
  body: Joi.object({
    customerId: Joi.string().required(),
    items: Joi.array().items(Joi.object(communicationBase)).min(1).required(),
  }),
};

const listCommunications = {
  query: Joi.object({
    customerId: Joi.string(),
    status: Joi.string().valid(...STATUSES),
    type: Joi.string().valid(...TYPES),
    comID: Joi.string(),
    limit: Joi.number().integer().min(1).max(500).default(50),
    skip: Joi.number().integer().min(0).default(0),
  }),
};

const idParam = {
  params: Joi.object({ id: Joi.string().required() }),
};

const statsQuery = {
  query: Joi.object({ customerId: Joi.string() }),
};

const bulkDelete = {
  body: Joi.object({
    ids: Joi.array().items(Joi.string()).default([]),
    all: Joi.boolean().default(false),
    filter: Joi.object({
      customerId: Joi.string(),
      status: Joi.string().valid(...STATUSES),
      type: Joi.string().valid(...TYPES),
      comID: Joi.string(),
    }).default({}),
  }).or('ids', 'all'),
};

module.exports = { addMany, listCommunications, idParam, statsQuery, bulkDelete };

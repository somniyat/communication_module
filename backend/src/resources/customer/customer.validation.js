const Joi = require('joi');

const apiEndpoint = Joi.object({
  url: Joi.string().uri().allow('').optional(),
  method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').default('GET'),
  headers: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
});

const createCustomer = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(120).required(),
    firebaseKey: Joi.alternatives().try(Joi.object(), Joi.string()).allow(null, ''),
    noReplyEmail: Joi.string().email().allow(''),
    defaultRecipientEmails: Joi.array().items(Joi.string().email()).default([]),
    whatsappSenderPhone: Joi.string().allow(''),
    smsSenderId: Joi.string().allow(''),
    communicationFetchApi: apiEndpoint.default({}),
    communicationUpdateApi: apiEndpoint.default({}),
    jobIntervalMs: Joi.number().integer().min(100).max(3600000).allow(null),
    active: Joi.boolean().default(true),
    notes: Joi.string().allow(''),
  }),
};

const updateCustomer = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(120),
    firebaseKey: Joi.alternatives().try(Joi.object(), Joi.string()).allow(null, ''),
    noReplyEmail: Joi.string().email().allow(''),
    defaultRecipientEmails: Joi.array().items(Joi.string().email()),
    whatsappSenderPhone: Joi.string().allow(''),
    smsSenderId: Joi.string().allow(''),
    communicationFetchApi: apiEndpoint,
    communicationUpdateApi: apiEndpoint,
    jobIntervalMs: Joi.number().integer().min(100).max(3600000).allow(null),
    active: Joi.boolean(),
    notes: Joi.string().allow(''),
  }).min(1),
};

const idParam = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

const listCustomers = {
  query: Joi.object({ active: Joi.boolean() }),
};

module.exports = { createCustomer, updateCustomer, idParam, listCustomers };

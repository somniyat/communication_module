const customerService = require('./customer.service');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const customers = await customerService.list(req.query);
  res.json({ data: customers });
});

const getOne = asyncHandler(async (req, res) => {
  const customer = await customerService.findById(req.params.id);
  res.json({ data: customer });
});

const create = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body);
  res.status(201).json({ data: customer });
});

const update = asyncHandler(async (req, res) => {
  const customer = await customerService.update(req.params.id, req.body);
  res.json({ data: customer });
});

const remove = asyncHandler(async (req, res) => {
  await customerService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getOne, create, update, remove };

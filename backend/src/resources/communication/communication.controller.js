const communicationService = require('./communication.service');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await communicationService.list(req.query);
  res.json({ data: result.items, meta: { total: result.total, limit: result.limit, skip: result.skip } });
});

const getOne = asyncHandler(async (req, res) => {
  const doc = await communicationService.findById(req.params.id);
  res.json({ data: doc });
});

const addMany = asyncHandler(async (req, res) => {
  const { customerId, items } = req.body;
  const results = await communicationService.addMany(customerId, items);
  res.status(201).json({
    data: results.map((r) => r.doc),
    meta: { inserted: results.filter((r) => r.inserted).length, total: results.length },
  });
});

const stats = asyncHandler(async (req, res) => {
  const data = await communicationService.stats(req.query);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  await communicationService.remove(req.params.id);
  res.status(204).end();
});

const bulkDelete = asyncHandler(async (req, res) => {
  const { ids, all, filter } = req.body;
  const result = all
    ? await communicationService.removeByFilter(filter || {})
    : await communicationService.removeMany(ids);
  res.json({ data: result });
});

module.exports = { list, getOne, addMany, stats, remove, bulkDelete };

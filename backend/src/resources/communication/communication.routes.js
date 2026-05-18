const express = require('express');
const controller = require('./communication.controller');
const validation = require('./communication.validation');
const { validate } = require('../../api/middlewares/validate.middleware');
const { authRequired, requireRole } = require('../../api/middlewares/auth.middleware');

const router = express.Router();

router.use(authRequired, requireRole('admin'));

router.get('/', validate(validation.listCommunications), controller.list);
router.get('/stats', validate(validation.statsQuery), controller.stats);
router.post('/', validate(validation.addMany), controller.addMany);
router.post('/bulk-delete', validate(validation.bulkDelete), controller.bulkDelete);
router.get('/:id', validate(validation.idParam), controller.getOne);
router.delete('/:id', validate(validation.idParam), controller.remove);

module.exports = router;

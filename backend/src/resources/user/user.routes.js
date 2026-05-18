const express = require('express');
const controller = require('./user.controller');
const validation = require('./user.validation');
const { validate } = require('../../api/middlewares/validate.middleware');
const { authRequired, requireRole } = require('../../api/middlewares/auth.middleware');

const router = express.Router();

router.use(authRequired);

router.get('/', requireRole('admin'), validate(validation.listUsers), controller.list);
router.get('/:id', requireRole('admin'), validate(validation.getUser), controller.getOne);

module.exports = router;

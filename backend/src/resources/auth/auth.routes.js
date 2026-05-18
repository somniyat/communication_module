const express = require('express');
const controller = require('./auth.controller');
const validation = require('./auth.validation');
const { validate } = require('../../api/middlewares/validate.middleware');
const { authRequired } = require('../../api/middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validate(validation.register), controller.register);
router.post('/login', validate(validation.login), controller.login);
router.get('/me', authRequired, controller.me);

module.exports = router;

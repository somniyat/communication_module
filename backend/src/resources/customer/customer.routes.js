const express = require('express');
const controller = require('./customer.controller');
const validation = require('./customer.validation');
const { validate } = require('../../api/middlewares/validate.middleware');
const { authRequired, requireRole } = require('../../api/middlewares/auth.middleware');

const router = express.Router();

router.use(authRequired, requireRole('admin'));

router.get('/', validate(validation.listCustomers), controller.list);
router.post('/', validate(validation.createCustomer), controller.create);
router.get('/:id', validate(validation.idParam), controller.getOne);
router.put('/:id', validate(validation.updateCustomer), controller.update);
router.delete('/:id', validate(validation.idParam), controller.remove);

module.exports = router;

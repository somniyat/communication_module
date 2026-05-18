const express = require('express');

const authRoutes = require('../resources/auth/auth.routes');
const userRoutes = require('../resources/user/user.routes');
const customerRoutes = require('../resources/customer/customer.routes');
const communicationRoutes = require('../resources/communication/communication.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/communications', communicationRoutes);

module.exports = router;

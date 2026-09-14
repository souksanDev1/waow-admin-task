const express = require('express');
const authRoutes = require('./auth.routes');
const roleRoutes = require('./role.routes');
const adminRoutes = require('./admin.routes');
const userRoutes = require('./user.routes');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/health', (req, res) => success(res, { ok: true }));
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/admins', adminRoutes);
router.use('/users', userRoutes);

module.exports = router;

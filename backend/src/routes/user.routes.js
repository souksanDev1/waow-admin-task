const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { requirePermission } = require('../middlewares/authorize');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/', authenticate, requirePermission('user_module', 'can_view'), userController.list);

module.exports = router;

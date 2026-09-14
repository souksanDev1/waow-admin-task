const express = require('express');
const { validate } = require('../middlewares/validate');
const { loginSchema } = require('../validations/schemas');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);

module.exports = router;

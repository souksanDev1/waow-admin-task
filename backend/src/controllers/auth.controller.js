const authService = require('../services/auth.service');
const { success } = require('../utils/response');

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return success(res, data, 'Login successful');
  } catch (err) {
    return next(err);
  }
}

module.exports = { login };

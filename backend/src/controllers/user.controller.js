const userService = require('../services/user.service');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const data = await userService.listUsers();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list };

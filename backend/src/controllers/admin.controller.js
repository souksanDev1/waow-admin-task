const adminService = require('../services/admin.service');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const data = await adminService.listAdmins();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await adminService.createAdmin(req.body);
    return success(res, data, 'Admin created', 201);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await adminService.updateAdmin(req.params.id, req.body);
    return success(res, data, 'Admin updated');
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await adminService.softDeleteAdmin(req.params.id, req.auth.adminId);
    return success(res, data, 'Admin deleted');
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const data = await adminService.resetPassword(req.params.id, req.body.password);
    return success(res, data, 'Password reset');
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove, resetPassword };

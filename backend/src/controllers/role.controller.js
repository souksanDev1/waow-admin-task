const roleService = require('../services/role.service');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const data = await roleService.listRoles();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await roleService.createRole(req.body);
    return success(res, data, 'Role created', 201);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await roleService.updateRole(req.params.id, req.body);
    return success(res, data, 'Role updated');
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await roleService.deleteRole(req.params.id);
    return success(res, data, 'Role deleted');
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };

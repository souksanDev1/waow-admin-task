const { Role, Admin } = require('../models');
const { AppError } = require('../utils/errors');

async function listRoles() {
  return Role.findAll({ order: [['id', 'ASC']] });
}

async function createRole({ name, permissions }) {
  const existing = await Role.findOne({ where: { name } });
  if (existing) {
    throw new AppError(409, 'ROLE_ERR_DUPLICATE', 'Role name already exists');
  }
  return Role.create({ name, permissions });
}

async function updateRole(id, payload) {
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError(404, 'ROLE_ERR_NOT_FOUND', 'Role not found');
  }

  if (payload.name && payload.name !== role.name) {
    const existing = await Role.findOne({ where: { name: payload.name } });
    if (existing) {
      throw new AppError(409, 'ROLE_ERR_DUPLICATE', 'Role name already exists');
    }
  }

  if (['SUPER_ADMIN', 'NORMAL'].includes(role.name) && payload.name && payload.name !== role.name) {
    throw new AppError(400, 'ROLE_ERR_PROTECTED', 'Cannot rename system role');
  }

  await role.update(payload);
  return role;
}

async function deleteRole(id) {
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError(404, 'ROLE_ERR_NOT_FOUND', 'Role not found');
  }

  if (['SUPER_ADMIN', 'NORMAL'].includes(role.name)) {
    throw new AppError(400, 'ROLE_ERR_PROTECTED', 'Cannot delete system role');
  }

  const adminCount = await Admin.count({ where: { role_id: id, is_deleted: false } });
  if (adminCount > 0) {
    throw new AppError(400, 'ROLE_ERR_IN_USE', 'Role is assigned to admins');
  }

  await role.destroy();
  return { id: Number(id) };
}

module.exports = { listRoles, createRole, updateRole, deleteRole };

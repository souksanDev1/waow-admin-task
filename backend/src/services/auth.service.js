const { Admin, Role } = require('../models');
const { AppError } = require('../utils/errors');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function login({ username, password }) {
  const admin = await Admin.findOne({
    where: { username, is_deleted: false },
    include: [{ model: Role, as: 'role' }],
  });

  if (!admin || !admin.role) {
    throw new AppError(401, 'AUTH_ERR_INVALID_CREDENTIALS', 'Invalid username or password');
  }

  const valid = await comparePassword(password, admin.password);
  if (!valid) {
    throw new AppError(401, 'AUTH_ERR_INVALID_CREDENTIALS', 'Invalid username or password');
  }

  const token = signToken({
    adminId: admin.id,
    roleId: admin.role_id,
    roleName: admin.role.name,
  });

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      roleName: admin.role.name,
      permissions: admin.role.permissions,
    },
  };
}

module.exports = { login };

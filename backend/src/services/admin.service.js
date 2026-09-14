const { Admin, Role, sequelize } = require('../models');
const { AppError } = require('../utils/errors');
const { hashPassword } = require('../utils/password');

async function getRoleOrThrow(roleId, transaction) {
  const role = await Role.findByPk(roleId, { transaction });
  if (!role) {
    throw new AppError(400, 'ADMIN_ERR_INVALID_ROLE', 'Role not found');
  }
  return role;
}

async function listAdmins() {
  const admins = await Admin.findAll({
    where: { is_deleted: false },
    include: [{ model: Role, as: 'role' }],
    order: [['id', 'ASC']],
  });
  return admins.map((a) => a.toSafeJSON());
}

async function createAdmin({ username, password, role_id }) {
  return sequelize.transaction(async (transaction) => {
    await getRoleOrThrow(role_id, transaction);

    const existing = await Admin.findOne({
      where: { username },
      transaction,
    });
    if (existing) {
      throw new AppError(409, 'ADMIN_ERR_DUPLICATE', 'Username already exists');
    }

    const hashed = await hashPassword(password);
    const admin = await Admin.create(
      {
        username,
        password: hashed,
        role_id,
        is_deleted: false,
        deleted_at: null,
      },
      { transaction },
    );

    await admin.reload({
      include: [{ model: Role, as: 'role' }],
      transaction,
    });
    return admin.toSafeJSON();
  });
}

async function updateAdmin(id, payload) {
  return sequelize.transaction(async (transaction) => {
    const admin = await Admin.findOne({
      where: { id, is_deleted: false },
      transaction,
    });
    if (!admin) {
      throw new AppError(404, 'ADMIN_ERR_NOT_FOUND', 'Admin not found');
    }

    if (payload.role_id) {
      await getRoleOrThrow(payload.role_id, transaction);
    }

    if (payload.username && payload.username !== admin.username) {
      const existing = await Admin.findOne({
        where: { username: payload.username },
        transaction,
      });
      if (existing) {
        throw new AppError(409, 'ADMIN_ERR_DUPLICATE', 'Username already exists');
      }
    }

    const updates = { ...payload };
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    await admin.update(updates, { transaction });
    await admin.reload({
      include: [{ model: Role, as: 'role' }],
      transaction,
    });
    return admin.toSafeJSON();
  });
}

async function softDeleteAdmin(id, actorId) {
  if (Number(id) === Number(actorId)) {
    throw new AppError(400, 'ADMIN_ERR_SELF_DELETE', 'Cannot delete your own account');
  }

  const admin = await Admin.findOne({ where: { id, is_deleted: false } });
  if (!admin) {
    throw new AppError(404, 'ADMIN_ERR_NOT_FOUND', 'Admin not found');
  }

  await admin.update({
    is_deleted: true,
    deleted_at: new Date(),
  });

  return { id: Number(id), is_deleted: true };
}

async function resetPassword(id, password) {
  const admin = await Admin.findOne({ where: { id, is_deleted: false } });
  if (!admin) {
    throw new AppError(404, 'ADMIN_ERR_NOT_FOUND', 'Admin not found');
  }

  const hashed = await hashPassword(password);
  await admin.update({ password: hashed });
  return { id: Number(id) };
}

module.exports = {
  listAdmins,
  createAdmin,
  updateAdmin,
  softDeleteAdmin,
  resetPassword,
};

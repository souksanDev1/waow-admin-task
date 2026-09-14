const { verifyToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');
const { Admin, Role } = require('../models');

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'AUTH_ERR_UNAUTHORIZED', 'Authentication required');
    }

    const payload = verifyToken(token);
    const admin = await Admin.findOne({
      where: { id: payload.adminId, is_deleted: false },
      include: [{ model: Role, as: 'role' }],
    });

    if (!admin || !admin.role) {
      throw new AppError(401, 'AUTH_ERR_UNAUTHORIZED', 'Authentication required');
    }

    req.admin = admin;
    req.auth = {
      adminId: admin.id,
      roleId: admin.role_id,
      roleName: admin.role.name,
      permissions: admin.role.permissions,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };

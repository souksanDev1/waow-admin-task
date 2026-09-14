const { AppError } = require('../utils/errors');

function requireSuperAdmin(req, _res, next) {
  if (req.auth?.roleName !== 'SUPER_ADMIN') {
    return next(new AppError(403, 'FORBIDDEN', 'Super admin access required'));
  }
  return next();
}

function requirePermission(moduleName, action) {
  return (req, _res, next) => {
    if (req.auth?.roleName === 'SUPER_ADMIN') {
      return next();
    }

    const allowed = Boolean(req.auth?.permissions?.[moduleName]?.[action]);
    if (!allowed) {
      return next(new AppError(403, 'FORBIDDEN', 'Permission denied'));
    }
    return next();
  };
}

module.exports = { requireSuperAdmin, requirePermission };

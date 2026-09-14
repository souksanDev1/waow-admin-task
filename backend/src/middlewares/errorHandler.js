const { fail } = require('../utils/response');
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return fail(res, err.status, err.code, err.message, err.data);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return fail(res, 401, 'AUTH_ERR_INVALID_TOKEN', 'Invalid or expired token');
  }

  if (err.isJoi) {
    const detail = err.details?.[0];
    const message = detail?.message || 'Validation failed';
    const code =
      detail?.type === 'object.unknown'
        ? 'VALIDATION_ERR_UNKNOWN_FIELD'
        : 'VALIDATION_ERR';
    return fail(res, 400, code, message);
  }

  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  return fail(
    res,
    500,
    'INTERNAL_ERR',
    isProd ? 'Internal server error' : err.message || 'Internal server error',
  );
}

module.exports = { errorHandler };

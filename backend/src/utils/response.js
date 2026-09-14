function success(res, data = {}, message = 'Success', status = 200) {
  return res.status(status).json({
    error: false,
    code: 0,
    message,
    data,
  });
}

function fail(res, status, code, message, data = {}) {
  return res.status(status).json({
    error: true,
    code,
    message,
    data,
  });
}

module.exports = { success, fail };

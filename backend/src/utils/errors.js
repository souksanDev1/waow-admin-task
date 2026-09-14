class AppError extends Error {
  constructor(status, code, message, data = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

module.exports = { AppError };

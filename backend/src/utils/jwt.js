const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

function signToken(payload) {
  const { jwtSecret, jwtExpiresIn } = getEnv();
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  const { jwtSecret } = getEnv();
  return jwt.verify(token, jwtSecret);
}

module.exports = { signToken, verifyToken };

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(user) {
  return jwt.sign({ sub: user.id, permissionLevel: user.permissionLevel }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

module.exports = { signToken, cookieOptions };

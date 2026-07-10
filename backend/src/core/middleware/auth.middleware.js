const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const env = require('../../config/env');
const ApiError = require('../utils/ApiError');
const { User } = require('../../models');

const protect = asyncHandler(async (req, _res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies[env.cookieName]) {
    token = req.cookies[env.cookieName];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authenticated. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw ApiError.unauthorized('Session expired or invalid token.');
  }

  const user = await User.findByPk(decoded.sub);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists.');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated.');
  }

  req.user = user;
  next();
});

const authorize = (...permissionLevels) => (req, _res, next) => {
  if (!req.user) throw ApiError.unauthorized('Not authenticated.');
  if (!permissionLevels.includes(req.user.permissionLevel)) {
    throw ApiError.forbidden('You do not have permission to perform this action.');
  }
  next();
};

module.exports = { protect, authorize };

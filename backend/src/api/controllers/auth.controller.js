const asyncHandler = require('express-async-handler');
const { User, Preference, ActivityLog } = require('../../models');
const ApiError = require('../../core/utils/ApiError');
const ApiResponse = require('../../core/utils/ApiResponse');
const { signToken, cookieOptions } = require('../../services/token.service');
const env = require('../../config/env');

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, organization } = req.body;

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone: phone || null,
    organization: organization || null,
    permissionLevel: 'viewer',
  });
  await Preference.create({ userId: user.id });

  const token = signToken(user);
  res.cookie(env.cookieName, token, cookieOptions());
  return ApiResponse.created(res, { user: user.toPublicJSON(), token });
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password.');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated.');

  user.lastLoginAt = new Date();
  await user.save();
  await ActivityLog.create({
    userId: user.id,
    action: 'login',
    description: `Logged in from ${req.headers['user-agent'] || 'unknown device'}`,
    ipAddress: req.ip,
  });

  const token = signToken(user);
  res.cookie(env.cookieName, token, cookieOptions());
  return ApiResponse.ok(res, { user: user.toPublicJSON(), token });
});

// POST /auth/logout
const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.cookieName);
  return ApiResponse.message(res, 'Logged out successfully.');
});

// GET /auth/me
const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, req.user.toPublicJSON());
});

module.exports = { register, login, logout, getMe };

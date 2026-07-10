const asyncHandler = require('express-async-handler');
const { User, Preference, ActivityLog } = require('../../models');
const ApiError = require('../../core/utils/ApiError');
const ApiResponse = require('../../core/utils/ApiResponse');

// GET /users/me  
const getProfile = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, req.user.toPublicJSON());
});

// PUT /users/me  
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) throw ApiError.notFound('User not found.');

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  await user.save();

  await ActivityLog.create({
    userId: user.id,
    action: 'profile_update',
    description: 'Updated profile details',
    ipAddress: req.ip,
  });

  return ApiResponse.ok(res, user.toPublicJSON());
});

// PUT /users/me/password  
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  await ActivityLog.create({
    userId: user.id,
    action: 'password_change',
    description: 'Changed account password',
    ipAddress: req.ip,
  });

  return ApiResponse.message(res, 'Password updated successfully.');
});

// GET /users/me/preferences 
const getPreferences = asyncHandler(async (req, res) => {
  const [prefs] = await Preference.findOrCreate({ where: { userId: req.user.id } });
  return ApiResponse.ok(res, prefs.toPublicJSON());
});

// PUT /users/me/preferences  
const updatePreferences = asyncHandler(async (req, res) => {
  const { criticalAlerts, suspiciousActivity, systemStatus, weeklyDigest } = req.body;

  const [prefs] = await Preference.findOrCreate({ where: { userId: req.user.id } });
  if (criticalAlerts !== undefined) prefs.criticalAlerts = criticalAlerts;
  if (suspiciousActivity !== undefined) prefs.suspiciousActivity = suspiciousActivity;
  if (systemStatus !== undefined) prefs.systemStatus = systemStatus;
  if (weeklyDigest !== undefined) prefs.weeklyDigest = weeklyDigest;
  await prefs.save();

  return ApiResponse.ok(res, prefs.toPublicJSON());
});

// GET /users/me/activity  
const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const logs = await ActivityLog.findAll({
    where: { userId: req.user.id },
    order: [['timestamp', 'DESC']],
    limit,
  });
  return ApiResponse.ok(res, logs.map((l) => l.toPublicJSON()));
});


const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);

  const { rows, count } = await User.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return ApiResponse.ok(
    res,
    rows.map((u) => u.toPublicJSON()),
    { total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 }
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const { permissionLevel, isActive, role } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');

  if (permissionLevel !== undefined) user.permissionLevel = permissionLevel;
  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined) user.role = role;
  await user.save();

  return ApiResponse.ok(res, user.toPublicJSON());
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  await user.destroy();
  return ApiResponse.message(res, 'User deleted.');
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  getActivity,
  listUsers,
  updateUser,
  deleteUser,
};

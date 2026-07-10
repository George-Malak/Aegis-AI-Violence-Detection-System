const asyncHandler = require('express-async-handler');
const { Notification } = require('../../models');
const ApiError = require('../../core/utils/ApiError');
const ApiResponse = require('../../core/utils/ApiResponse');

// PATCH /notifications/:id/read 
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) throw ApiError.notFound('Notification not found.');

  notification.read = true;
  await notification.save();
  return ApiResponse.ok(res, notification.toPublicJSON());
});

// PATCH /notifications/read-all
const markAllRead = asyncHandler(async (_req, res) => {
  await Notification.update({ read: true }, { where: { read: false } });
  return ApiResponse.message(res, 'All notifications marked as read.');
});

module.exports = { markRead, markAllRead };

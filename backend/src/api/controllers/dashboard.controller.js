const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { sequelize, Detection, Camera, Notification } = require('../../models');
const ApiResponse = require('../../core/utils/ApiResponse');
const env = require('../../config/env');

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /dashboard/stats 
const getStats = asyncHandler(async (_req, res) => {
  const todayStart = startOfDay();
  const yesterdayStart = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const [alertsToday, alertsYesterday, eventsToday, onlineCameras, totalCameras, camerasMaintenance] =
    await Promise.all([
      Detection.count({ where: { status: { [Op.in]: ['danger', 'warning'] }, time: { [Op.gte]: todayStart } } }),
      Detection.count({
        where: {
          status: { [Op.in]: ['danger', 'warning'] },
          time: { [Op.gte]: yesterdayStart, [Op.lt]: todayStart },
        },
      }),
      Detection.count({ where: { time: { [Op.gte]: todayStart } } }),
      Camera.count({ where: { status: 'online' } }),
      Camera.count(),
      Camera.count({ where: { status: 'maintenance' } }),
    ]);

  return ApiResponse.ok(res, {
    alertsToday,
    alertsDelta: alertsToday - alertsYesterday,
    aiAccuracy: env.aiModelAccuracy,
    aiModelVersion: env.aiModelVersion,
    eventsToday,
    onlineCameras,
    totalCameras,
    camerasMaintenance,
  });
});

// GET /detections  
const listDetections = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 25);
  const { search, status } = req.query;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { event: { [Op.like]: `%${search}%` } },
      { cameraNameSnapshot: { [Op.like]: `%${search}%` } },
      { locationSnapshot: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Detection.findAndCountAll({
    where,
    include: [{ model: Camera, attributes: ['name', 'location'] }],
    order: [['time', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return ApiResponse.ok(res, {
    detections: rows.map((d) => d.toPublicJSON()),
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 },
  });
});

// GET /notifications 
const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(100, Number(req.query.limit) || 5);
  const unreadOnly = req.query.unread === undefined ? true : req.query.unread === 'true';

  const where = {};
  if (unreadOnly) where.read = false;

  const notifications = await Notification.findAll({
    where,
    order: [['timestamp', 'DESC']],
    limit,
  });

  return ApiResponse.ok(res, notifications.map((n) => n.toPublicJSON()));
});

// GET /system/status  
const getSystemStatus = asyncHandler(async (_req, res) => {
  let apiGateway = 'operational';
  const aiCluster = env.mlServiceUrl ? 'operational' : 'warning'; // "warning" = currently running on the mock predictor

  try {
    await sequelize.authenticate();
  } catch {
    apiGateway = 'critical';
  }

  return ApiResponse.ok(res, {
    apiGateway,
    aiCluster,
    storageNodes: [
      { name: 'Node 1', status: 'operational' },
      { name: 'Node 2', status: 'operational' },
      { name: 'Node 3', status: 'operational' },
    ],
  });
});

module.exports = { getStats, listDetections, listNotifications, getSystemStatus };

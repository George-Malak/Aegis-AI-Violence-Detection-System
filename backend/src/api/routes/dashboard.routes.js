const express = require('express');
const { protect } = require('../../core/middleware/auth.middleware');
const { getStats, listDetections, listNotifications, getSystemStatus } = require('../controllers/dashboard.controller');
const { markRead, markAllRead } = require('../controllers/notification.controller');

const router = express.Router();

router.use(protect);

// GET /dashboard/stats
router.get('/dashboard/stats', getStats);

// GET /detections
router.get('/detections', listDetections);

// GET /notifications
router.get('/notifications', listNotifications);
// Extensions beyond the contract:
router.patch('/notifications/read-all', markAllRead);
router.patch('/notifications/:id/read', markRead);

// GET /system/status
router.get('/system/status', getSystemStatus);

module.exports = router;

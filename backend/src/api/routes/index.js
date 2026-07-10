const express = require('express');

const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes'); // mounts /dashboard/stats, /detections, /notifications, /system/status
const cameraRoutes = require('./camera.routes');
const userRoutes = require('./user.routes');
const ingestionRoutes = require('./ingestion.routes'); // /detections/analyze — extension

const router = express.Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'Agesis API is healthy' }));

router.use('/auth', authRoutes);
router.use('/', dashboardRoutes); // dashboard.routes.js defines its own full sub-paths
router.use('/cameras', cameraRoutes);
router.use('/users', userRoutes);
router.use('/detections', ingestionRoutes);

module.exports = router;

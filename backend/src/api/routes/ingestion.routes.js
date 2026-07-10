const express = require('express');
const { body } = require('express-validator');
const validate = require('../../core/middleware/validate.middleware');
const { protect } = require('../../core/middleware/auth.middleware');
const { videoUpload } = require('../../core/middleware/upload.middleware');
const { analyzeVideo } = require('../controllers/ingestion.controller');

const router = express.Router();

router.use(protect);

router.post('/analyze', videoUpload.single('video'), [body('cameraId').optional().isString()], validate, analyzeVideo);

module.exports = router;

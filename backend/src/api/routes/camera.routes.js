const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../../core/middleware/validate.middleware');
const { protect, authorize } = require('../../core/middleware/auth.middleware');
const { listCameras, getCamera, createCamera, updateCamera, deleteCamera } = require('../controllers/camera.controller');

const router = express.Router();

router.use(protect);

// GET /cameras  
router.get('/', listCameras);
router.get('/:id', getCamera);

router.post(
  '/',
  authorize('admin', 'operator'),
  [
    body('name').trim().notEmpty().withMessage('Camera name is required'),
    body('location').trim().notEmpty().withMessage('Camera location is required'),
    body('streamUrl').optional({ nullable: true }).isString(),
    body('status').optional().isIn(['online', 'offline', 'maintenance']),
  ],
  validate,
  createCamera
);

router.put(
  '/:id',
  authorize('admin', 'operator'),
  [
    param('id').notEmpty(),
    body('name').optional().trim().notEmpty(),
    body('location').optional().trim().notEmpty(),
    body('streamUrl').optional({ nullable: true }).isString(),
    body('status').optional().isIn(['online', 'offline', 'maintenance']),
  ],
  validate,
  updateCamera
);

router.delete('/:id', authorize('admin'), deleteCamera);

module.exports = router;

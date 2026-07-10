const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../../core/middleware/validate.middleware');
const { protect, authorize } = require('../../core/middleware/auth.middleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  getActivity,
  listUsers,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.put(
  '/me',
  [body('firstName').optional().trim().notEmpty(), body('lastName').optional().trim().notEmpty(), body('phone').optional().isString()],
  validate,
  updateProfile
);

router.put(
  '/me/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  changePassword
);

router.get('/me/preferences', getPreferences);
router.put(
  '/me/preferences',
  [
    body('criticalAlerts').optional().isBoolean(),
    body('suspiciousActivity').optional().isBoolean(),
    body('systemStatus').optional().isBoolean(),
    body('weeklyDigest').optional().isBoolean(),
  ],
  validate,
  updatePreferences
);

router.get('/me/activity', getActivity);

router.get('/', authorize('admin'), listUsers);
router.patch(
  '/:id',
  authorize('admin'),
  [param('id').notEmpty(), body('permissionLevel').optional().isIn(['admin', 'operator', 'viewer']), body('isActive').optional().isBoolean()],
  validate,
  updateUser
);
router.delete('/:id', authorize('admin'), [param('id').notEmpty()], validate, deleteUser);

module.exports = router;

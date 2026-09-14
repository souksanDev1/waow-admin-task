const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { requirePermission, requireSuperAdmin } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const {
  createAdminSchema,
  updateAdminSchema,
  resetPasswordSchema,
} = require('../validations/schemas');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission('admin_module', 'can_view'), adminController.list);
router.post(
  '/',
  requirePermission('admin_module', 'can_create'),
  validate(createAdminSchema),
  adminController.create,
);
router.put(
  '/:id',
  requirePermission('admin_module', 'can_update'),
  validate(updateAdminSchema),
  adminController.update,
);
router.delete(
  '/:id',
  requirePermission('admin_module', 'can_delete'),
  adminController.remove,
);
router.post(
  '/:id/reset-password',
  requireSuperAdmin,
  validate(resetPasswordSchema),
  adminController.resetPassword,
);

module.exports = router;

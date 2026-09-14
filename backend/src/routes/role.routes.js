const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { requireSuperAdmin } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const { createRoleSchema, updateRoleSchema } = require('../validations/schemas');
const roleController = require('../controllers/role.controller');

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get('/', roleController.list);
router.post('/', validate(createRoleSchema), roleController.create);
router.put('/:id', validate(updateRoleSchema), roleController.update);
router.delete('/:id', roleController.remove);

module.exports = router;

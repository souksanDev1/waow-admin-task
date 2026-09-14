const Joi = require('joi');

const modulePermissionsSchema = Joi.object({
  can_create: Joi.boolean().required(),
  can_delete: Joi.boolean().required(),
  can_update: Joi.boolean().required(),
  can_view: Joi.boolean().required(),
})
  .required()
  .unknown(false);

const permissionsSchema = Joi.object({
  admin_module: modulePermissionsSchema,
  user_module: modulePermissionsSchema,
})
  .required()
  .unknown(false);

const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(100).required(),
  password: Joi.string().min(1).max(255).required(),
}).unknown(false);

const createRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  permissions: permissionsSchema,
}).unknown(false);

const updateRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  permissions: permissionsSchema,
})
  .min(1)
  .unknown(false);

const createAdminSchema = Joi.object({
  username: Joi.string().trim().min(3).max(100).required(),
  password: Joi.string().min(6).max(255).required(),
  role_id: Joi.number().integer().positive().required(),
}).unknown(false);

const updateAdminSchema = Joi.object({
  username: Joi.string().trim().min(3).max(100),
  password: Joi.string().min(6).max(255),
  role_id: Joi.number().integer().positive(),
})
  .min(1)
  .unknown(false);

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).max(255).required(),
}).unknown(false);

module.exports = {
  loginSchema,
  createRoleSchema,
  updateRoleSchema,
  createAdminSchema,
  updateAdminSchema,
  resetPasswordSchema,
};

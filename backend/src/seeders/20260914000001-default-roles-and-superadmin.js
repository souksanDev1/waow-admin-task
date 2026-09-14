'use strict';

const { hashPassword } = require('../utils/password');

const FULL_PERMISSIONS = {
  admin_module: {
    can_create: true,
    can_delete: true,
    can_update: true,
    can_view: true,
  },
  user_module: {
    can_create: true,
    can_delete: true,
    can_update: true,
    can_view: true,
  },
};

const NORMAL_PERMISSIONS = {
  admin_module: {
    can_create: false,
    can_delete: false,
    can_update: false,
    can_view: true,
  },
  user_module: {
    can_create: false,
    can_delete: false,
    can_update: false,
    can_view: true,
  },
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingRoles] = await queryInterface.sequelize.query(
      `SELECT name FROM roles WHERE name IN ('SUPER_ADMIN', 'NORMAL')`,
    );
    const existingNames = new Set(existingRoles.map((r) => r.name));

    const rolesToInsert = [];
    if (!existingNames.has('SUPER_ADMIN')) {
      rolesToInsert.push({
        name: 'SUPER_ADMIN',
        permissions: JSON.stringify(FULL_PERMISSIONS),
        created_at: now,
        updated_at: now,
      });
    }
    if (!existingNames.has('NORMAL')) {
      rolesToInsert.push({
        name: 'NORMAL',
        permissions: JSON.stringify(NORMAL_PERMISSIONS),
        created_at: now,
        updated_at: now,
      });
    }

    if (rolesToInsert.length) {
      await queryInterface.bulkInsert('roles', rolesToInsert);
    }

    const [superRoles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1`,
    );
    const superRoleId = superRoles[0].id;

    const [existingAdmins] = await queryInterface.sequelize.query(
      `SELECT id FROM admins WHERE username = 'superadmin' LIMIT 1`,
    );

    if (!existingAdmins.length) {
      const password = await hashPassword('123456');
      await queryInterface.bulkInsert('admins', [
        {
          username: 'superadmin',
          password,
          role_id: superRoleId,
          is_deleted: false,
          deleted_at: null,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('admins', { username: 'superadmin' });
    await queryInterface.bulkDelete('roles', { name: ['SUPER_ADMIN', 'NORMAL'] });
  },
};

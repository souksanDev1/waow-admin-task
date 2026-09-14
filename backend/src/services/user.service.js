const { User } = require('../models');

async function listUsers() {
  return User.findAll({
    order: [['id', 'ASC']],
    attributes: ['id', 'phone_number', 'name', 'profile_image', 'created_at', 'updated_at'],
  });
}

module.exports = { listUsers };

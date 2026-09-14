const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      tableName: 'roles',
      underscored: true,
    },
  );

  Role.associate = (models) => {
    Role.hasMany(models.Admin, { foreignKey: 'role_id', as: 'admins' });
  };

  return Role;
};

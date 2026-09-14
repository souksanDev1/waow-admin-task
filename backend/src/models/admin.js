const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define(
    'Admin',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'admins',
      underscored: true,
    },
  );

  Admin.associate = (models) => {
    Admin.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
  };

  Admin.prototype.toSafeJSON = function toSafeJSON() {
    return {
      id: this.id,
      username: this.username,
      role_id: this.role_id,
      role: this.role
        ? {
            id: this.role.id,
            name: this.role.name,
            permissions: this.role.permissions,
          }
        : undefined,
      is_deleted: this.is_deleted,
      deleted_at: this.deleted_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  };

  return Admin;
};

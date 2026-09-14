const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
    },
  );

  return User;
};

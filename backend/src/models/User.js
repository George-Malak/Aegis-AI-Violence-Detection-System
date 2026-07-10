const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const generateId = require('../core/utils/id');

module.exports = (sequelize) => {
  class User extends Model {
    comparePassword(candidate) {
      return bcrypt.compare(candidate, this.password);
    }

    toPublicJSON() {
      return {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        role: this.role,
        organization: this.organization,
        avatarUrl: this.avatarUrl,
      };
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => generateId('usr'),
      },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
          this.setDataValue('email', value ? value.toLowerCase().trim() : value);
        },
      },
      password: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Security Operator',
      },
      permissionLevel: {
        type: DataTypes.ENUM('admin', 'operator', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      organization: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      avatarUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};

const { Model, DataTypes } = require('sequelize');
const generateId = require('../core/utils/id');

module.exports = (sequelize) => {
  class ActivityLog extends Model {
    /** Shape matches a row in GET /users/me/activity */
    toPublicJSON() {
      return {
        id: this.id,
        action: this.action,
        description: this.description,
        ipAddress: this.ipAddress,
        timestamp: this.timestamp,
      };
    }
  }

  ActivityLog.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => generateId('act'),
      },
      action: { type: DataTypes.STRING, allowNull: false }, // e.g. "login", "password_change", "profile_update"
      description: { type: DataTypes.STRING, allowNull: false },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'ActivityLog',
      tableName: 'activity_logs',
      indexes: [{ fields: ['timestamp'] }],
    }
  );

  return ActivityLog;
};

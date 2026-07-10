const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Preference extends Model {
    toPublicJSON() {
      return {
        criticalAlerts: this.criticalAlerts,
        suspiciousActivity: this.suspiciousActivity,
        systemStatus: this.systemStatus,
        weeklyDigest: this.weeklyDigest,
      };
    }
  }

  Preference.init(
    {
      criticalAlerts: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      suspiciousActivity: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      systemStatus: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      weeklyDigest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'Preference',
      tableName: 'preferences',
    }
  );

  return Preference;
};

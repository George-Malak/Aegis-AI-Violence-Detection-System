const { Model, DataTypes } = require('sequelize');
const generateId = require('../core/utils/id');

module.exports = (sequelize) => {
  class Notification extends Model {
    toPublicJSON() {
      return {
        id: this.id,
        type: this.type,
        title: this.title,
        message: this.message,
        timestamp: this.timestamp,
        read: this.read,
        detectionId: this.detectionId,
      };
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => generateId('notif'),
      },
      type: {
        type: DataTypes.ENUM('danger', 'warning', 'info', 'neutral', 'success'),
        allowNull: false,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.STRING, allowNull: false },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      indexes: [{ fields: ['timestamp'] }, { fields: ['read'] }],
    }
  );

  return Notification;
};

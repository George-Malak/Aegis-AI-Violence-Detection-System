const { Model, DataTypes } = require('sequelize');
const generateId = require('../core/utils/id');

module.exports = (sequelize) => {
  class Detection extends Model {
    toPublicJSON() {
      return {
        id: this.id,
        time: this.time,
        camera: this.Camera ? this.Camera.name : this.cameraNameSnapshot,
        event: this.event,
        confidence: this.confidence,
        location: this.Camera ? this.Camera.location : this.locationSnapshot,
        status: this.status,
        thumbnailUrl: this.thumbnailUrl,
      };
    }
  }

  Detection.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => generateId('det'),
      },
      time: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      event: { type: DataTypes.STRING, allowNull: false },
      confidence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 100 },
      },
      status: {
        type: DataTypes.ENUM('danger', 'warning', 'info', 'neutral', 'success'),
        allowNull: false,
        defaultValue: 'info',
      },
      thumbnailUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      modelVersion: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      cameraNameSnapshot: { type: DataTypes.STRING, allowNull: true },
      locationSnapshot: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Detection',
      tableName: 'detections',
      indexes: [{ fields: ['time'] }, { fields: ['status'] }],
    }
  );

  return Detection;
};

const { Model, DataTypes } = require('sequelize');
const generateId = require('../core/utils/id');

module.exports = (sequelize) => {
  class Camera extends Model {
    /** Shape matches GET /cameras entries in the API contract. */
    toPublicJSON() {
      return {
        id: this.id,
        name: this.name,
        location: this.location,
        status: this.status,
        streamUrl: this.streamUrl,
      };
    }
  }

  Camera.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => generateId('cam'),
      },
      name: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM('online', 'offline', 'maintenance'),
        allowNull: false,
        defaultValue: 'offline',
      },
      streamUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    },
    {
      sequelize,
      modelName: 'Camera',
      tableName: 'cameras',
    }
  );

  return Camera;
};

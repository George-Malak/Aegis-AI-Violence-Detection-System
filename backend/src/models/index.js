const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const Camera = require('./Camera')(sequelize);
const Detection = require('./Detection')(sequelize);
const Notification = require('./Notification')(sequelize);
const Preference = require('./Preference')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);

// --- Associations ---

User.hasOne(Preference, { foreignKey: 'userId', onDelete: 'CASCADE' });
Preference.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

Camera.hasMany(Detection, { foreignKey: 'cameraId', onDelete: 'SET NULL' });
Detection.belongsTo(Camera, { foreignKey: 'cameraId' });

Detection.hasMany(Notification, { foreignKey: 'detectionId', onDelete: 'SET NULL' });
Notification.belongsTo(Detection, { foreignKey: 'detectionId' });

User.hasMany(Detection, { foreignKey: 'createdById', onDelete: 'SET NULL' });
Detection.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

module.exports = {
  sequelize,
  User,
  Camera,
  Detection,
  Notification,
  Preference,
  ActivityLog,
};

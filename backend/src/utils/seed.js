/* Seeds an admin user + demo cameras/detections/notifications so the frontend
   has realistic data immediately, matching the shapes in the API contract.
   Usage: npm run db:seed */

const { sequelize, connectDB } = require('../config/database');
const { User, Camera, Detection, Notification, Preference, ActivityLog } = require('../models');
const env = require('../config/env');
const logger = require('../core/utils/logger');

async function run() {
  await connectDB();
  await sequelize.sync({ alter: true });

  const [admin, created] = await User.findOrCreate({
    where: { email: env.seedAdmin.email.toLowerCase() },
    defaults: {
      firstName: env.seedAdmin.firstName,
      lastName: env.seedAdmin.lastName,
      password: env.seedAdmin.password,
      role: 'Security Administrator',
      organization: 'Global Secure Corp',
      permissionLevel: 'admin',
    },
  });
  if (created) {
    await Preference.create({ userId: admin.id });
    logger.info(`Admin created: ${admin.email} / ${env.seedAdmin.password} (change this password!)`);
  } else {
    logger.info(`Admin already exists: ${admin.email}`);
  }

  const cameraCount = await Camera.count();
  if (cameraCount === 0) {
    const cameras = await Camera.bulkCreate([
      { name: 'Lobby East', location: 'Building A', status: 'online', streamUrl: 'wss://stream.agesis.local/cam-lobby-east' },
      { name: 'Parking Garage', location: 'Building B', status: 'online', streamUrl: 'wss://stream.agesis.local/cam-parking' },
      { name: 'Warehouse 3', location: 'Building C', status: 'online', streamUrl: 'wss://stream.agesis.local/cam-warehouse-3' },
      { name: 'Rooftop North', location: 'Building A', status: 'maintenance', streamUrl: null },
      { name: 'Loading Dock', location: 'Building C', status: 'offline', streamUrl: null },
    ]);
    logger.info(`Seeded ${cameras.length} cameras.`);

    const [lobby, , warehouse] = cameras;

    const det1 = await Detection.create({
      cameraId: lobby.id,
      cameraNameSnapshot: lobby.name,
      locationSnapshot: lobby.location,
      event: 'Weapon / Violence Detection',
      confidence: 94,
      status: 'danger',
      thumbnailUrl: null,
      modelVersion: 'mock-v0',
      createdById: admin.id,
    });
    await Notification.create({
      type: 'danger',
      title: 'Weapon / Violence Detection',
      message: `detected at ${lobby.location}`,
      detectionId: det1.id,
    });

    const det2 = await Detection.create({
      cameraId: warehouse.id,
      cameraNameSnapshot: warehouse.name,
      locationSnapshot: warehouse.location,
      event: 'Suspicious Activity',
      confidence: 68,
      status: 'warning',
      thumbnailUrl: null,
      modelVersion: 'mock-v0',
      createdById: admin.id,
    });
    await Notification.create({
      type: 'warning',
      title: 'Suspicious Activity',
      message: `detected at ${warehouse.location}`,
      detectionId: det2.id,
    });

    await ActivityLog.create({
      userId: admin.id,
      action: 'login',
      description: 'Logged in from Chrome on Windows',
      ipAddress: '192.168.1.45',
    });

    logger.info('Seeded demo detections, notifications, and activity log.');
  } else {
    logger.info('Cameras already exist, skipping demo data seed.');
  }

  process.exit(0);
}

run().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});

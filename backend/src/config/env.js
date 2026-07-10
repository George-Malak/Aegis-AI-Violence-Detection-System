require('dotenv').config();

const env = {
  port: Number(process.env.PORT || 8000),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  db: {
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: process.env.DB_STORAGE || './data/agesis.sqlite',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'agesis',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456789',
  },

  jwtSecret: process.env.JWT_SECRET || 'dev_only_insecure_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'agesis_token',

  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 200),

  mlServiceUrl: process.env.ML_SERVICE_URL || '',
  mlServiceTimeoutMs: Number(process.env.ML_SERVICE_TIMEOUT_MS || 15000),

  detectionMinConfidence: Number(process.env.DETECTION_MIN_CONFIDENCE || 30),

  aiModelAccuracy: Number(process.env.AI_MODEL_ACCURACY || 94.2),
  aiModelVersion: process.env.AI_MODEL_VERSION || 'v2.1.4',

  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || 'john@agesis.ai',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
    firstName: process.env.SEED_ADMIN_FIRST_NAME || 'John',
    lastName: process.env.SEED_ADMIN_LAST_NAME || 'Doe',
  },
};

module.exports = env;

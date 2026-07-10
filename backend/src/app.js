const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const apiRoutes = require('./api/routes');
const { notFound, errorHandler } = require('./core/middleware/error.middleware');
const { uploadRoot } = require('./core/middleware/upload.middleware');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // allow <img>/<video> to load /uploads
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(
  env.apiPrefix,
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false })
);

// Serve uploaded videos/frames so the dashboard can preview thumbnailUrl/mediaUrl directly.
app.use('/uploads', express.static(uploadRoot));

app.use(env.apiPrefix, apiRoutes);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Agesis AI Violence Detection System — API', docs: `${env.apiPrefix}/health` });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

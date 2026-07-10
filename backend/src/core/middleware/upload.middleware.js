const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../../config/env');
const ApiError = require('../utils/ApiError');

const uploadRoot = path.isAbsolute(env.uploadDir) ? env.uploadDir : path.join(process.cwd(), env.uploadDir);
const videosDir = path.join(uploadRoot, 'videos');
const framesDir = path.join(uploadRoot, 'frames');

[uploadRoot, videosDir, framesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/webm', 'video/x-matroska']);
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

function makeStorage(destDir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

const videoUpload = multer({
  storage: makeStorage(videosDir),
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED_VIDEO_MIME.has(file.mimetype) ? cb(null, true) : cb(ApiError.badRequest(`Unsupported video type: ${file.mimetype}`)),
});

const frameUpload = multer({
  storage: makeStorage(framesDir),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED_IMAGE_MIME.has(file.mimetype) ? cb(null, true) : cb(ApiError.badRequest(`Unsupported image type: ${file.mimetype}`)),
});

module.exports = { videoUpload, frameUpload, uploadRoot, videosDir, framesDir };

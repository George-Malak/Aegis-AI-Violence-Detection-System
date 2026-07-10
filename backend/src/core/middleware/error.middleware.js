const multer = require('multer');
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../../config/env');

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, _next) {
  let error = err;

  if (err instanceof multer.MulterError) {
    error = ApiError.badRequest(`Upload error: ${err.message}`);
  } else if (err instanceof UniqueConstraintError) {
    const field = Object.keys(err.fields || {})[0] || 'field';
    error = ApiError.conflict(`${field} already exists`);
  } else if (err instanceof ValidationError) {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    error = ApiError.badRequest('Validation failed', details);
  } else if (err instanceof DatabaseError) {
    error = ApiError.badRequest('Invalid data submitted.');
  } else if (!(err instanceof ApiError)) {
    error = ApiError.internal(env.nodeEnv === 'production' ? 'Internal server error' : err.message);
  }

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  const body = { success: false, message: error.message };
  if (error.details) body.errors = error.details;
  if (env.nodeEnv === 'development' && error.statusCode >= 500) body.stack = err.stack;

  res.status(error.statusCode || 500).json(body);
}

module.exports = { notFound, errorHandler };

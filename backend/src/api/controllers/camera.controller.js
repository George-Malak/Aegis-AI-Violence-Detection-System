const asyncHandler = require('express-async-handler');
const { Camera } = require('../../models');
const ApiError = require('../../core/utils/ApiError');
const ApiResponse = require('../../core/utils/ApiResponse');
const { emitCameraStatusChange } = require('../../sockets');

// GET /cameras
const listCameras = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;

  const cameras = await Camera.findAll({ where, order: [['name', 'ASC']] });
  return ApiResponse.ok(res, cameras.map((c) => c.toPublicJSON()));
});

const getCamera = asyncHandler(async (req, res) => {
  const camera = await Camera.findByPk(req.params.id);
  if (!camera) throw ApiError.notFound('Camera not found.');
  return ApiResponse.ok(res, camera.toPublicJSON());
});

const createCamera = asyncHandler(async (req, res) => {
  const { name, location, streamUrl, status } = req.body;
  const camera = await Camera.create({ name, location, streamUrl: streamUrl || null, status: status || 'offline' });
  return ApiResponse.created(res, camera.toPublicJSON());
});

const updateCamera = asyncHandler(async (req, res) => {
  const { name, location, streamUrl, status } = req.body;
  const camera = await Camera.findByPk(req.params.id);
  if (!camera) throw ApiError.notFound('Camera not found.');

  const statusChanged = status !== undefined && status !== camera.status;

  if (name !== undefined) camera.name = name;
  if (location !== undefined) camera.location = location;
  if (streamUrl !== undefined) camera.streamUrl = streamUrl;
  if (status !== undefined) camera.status = status;
  await camera.save();

  if (statusChanged) emitCameraStatusChange(camera.id, camera.status);

  return ApiResponse.ok(res, camera.toPublicJSON());
});

const deleteCamera = asyncHandler(async (req, res) => {
  const camera = await Camera.findByPk(req.params.id);
  if (!camera) throw ApiError.notFound('Camera not found.');
  await camera.destroy();
  return ApiResponse.message(res, 'Camera removed.');
});

module.exports = { listCameras, getCamera, createCamera, updateCamera, deleteCamera };

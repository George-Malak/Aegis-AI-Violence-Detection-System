const path = require('path');
const asyncHandler = require('express-async-handler');
const { Detection, Camera, Notification } = require('../../models');
const ApiError = require('../../core/utils/ApiError');
const ApiResponse = require('../../core/utils/ApiResponse');
const inferenceService = require('../../services/inference.service');
const classification = require('../../services/classification.service');
const { emitDetectionNew, emitNotificationNew } = require('../../sockets');
const env = require('../../config/env');

function toPublicUrl(absolutePath, subdir) {
  return `/uploads/${subdir}/${path.basename(absolutePath)}`;
}

const analyzeVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No video file uploaded. Attach it under the "video" field.');
  }

  const { cameraId } = req.body;
  let camera = null;
  if (cameraId) {
    camera = await Camera.findByPk(cameraId);
    if (!camera) throw ApiError.notFound('Camera not found.');
  }

  const prediction = await inferenceService.analyzeMedia(req.file.path);
  const { event, status, notify } = classification.classify(prediction);
  const mediaUrl = toPublicUrl(req.file.path, 'videos');

  if (prediction.confidencePct < env.detectionMinConfidence) {
    return ApiResponse.ok(res, { prediction, mediaUrl, detection: null, notification: null });
  }

  const detection = await Detection.create({
    cameraId: camera ? camera.id : null,
    cameraNameSnapshot: camera ? camera.name : 'Unassigned',
    locationSnapshot: camera ? camera.location : 'Unknown',
    event,
    confidence: prediction.confidencePct,
    status,
    thumbnailUrl: mediaUrl,
    modelVersion: prediction.modelVersion,
    createdById: req.user.id,
  });
  detection.Camera = camera;

  let notification = null;
  if (notify) {
    notification = await Notification.create({
      type: status,
      title: event,
      message: `detected at ${camera ? camera.location : 'an unassigned camera'}`,
      detectionId: detection.id,
    });
  }

  const detectionPayload = detection.toPublicJSON();
  emitDetectionNew(detectionPayload);
  if (notification) emitNotificationNew(notification.toPublicJSON());

  return ApiResponse.ok(res, {
    prediction,
    detection: detectionPayload,
    notification: notification ? notification.toPublicJSON() : null,
  });
});

module.exports = { analyzeVideo };

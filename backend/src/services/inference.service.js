const axios = require('axios');
const path = require('path');
const env = require('../config/env');
const logger = require('../core/utils/logger');

/**
 * Expected contract for the ML microservice:
 *   POST {ML_SERVICE_URL}
 *   body: { "video_path": "<path to the uploaded file>" }
 *   200 response: { "label": "violence" | "non_violence", "confidence": 0.0-1.0, "model_version": "string" }
 */

async function callRealService(filePath) {
  const response = await axios.post(
    env.mlServiceUrl,
    { video_path: path.resolve(filePath) },
    { timeout: env.mlServiceTimeoutMs }
  );

  const { label, confidence, model_version: modelVersion } = response.data || {};
  if (!label || typeof confidence !== 'number') {
    throw new Error('ML service returned an unexpected response shape');
  }

  return {
    label,
    confidencePct: Math.round(confidence * 100),
    modelVersion: modelVersion || 'ml_core-unversioned',
    mocked: false,
  };
}

function mockPredict() {
  const confidence = Math.random(); // 0-1
  const label = confidence >= 0.5 ? 'violence' : 'non_violence';
  return {
    label,
    confidencePct: Math.round(confidence * 100),
    modelVersion: 'mock-v0',
    mocked: true,
  };
}

/**
 * @param {string} filePath
 * @returns {Promise<{label: 'violence'|'non_violence', confidencePct: number, modelVersion: string, mocked: boolean}>}
 */
async function analyzeMedia(filePath) {
  if (!env.mlServiceUrl) {
    logger.warn('ML_SERVICE_URL not configured — using mock predictor.');
    return mockPredict();
  }

  try {
    return await callRealService(filePath);
  } catch (err) {
    logger.warn(`ML service call failed (${err.message}) — falling back to mock predictor.`);
    return mockPredict();
  }
}

module.exports = { analyzeMedia };

const crypto = require('crypto');

/**
 * Generates short, prefixed, URL-safe ids like "usr_3fa1c2b4" to match the
 * expected id format (e.g. "usr_5j2k9", "det_8f7d9s").
 */
function generateId(prefix) {
  const random = crypto.randomBytes(5).toString('hex');
  return `${prefix}_${random}`;
}

module.exports = generateId;

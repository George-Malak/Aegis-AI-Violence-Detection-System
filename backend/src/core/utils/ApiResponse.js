/**
 * Matches the response:
 *   { success: true, data: ... }            for normal responses
 *   { success: true, message: "..." }       for message-only responses (e.g. password change)
 *   { success: true, data: ..., meta: ... }  for paginated lists
 */
class ApiResponse {
  static send(res, statusCode, { data, message, meta } = {}) {
    const body = { success: statusCode < 400 };
    if (data !== undefined) body.data = data;
    if (message !== undefined) body.message = message;
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static ok(res, data, meta) {
    return ApiResponse.send(res, 200, { data, meta });
  }

  static message(res, message, statusCode = 200) {
    return ApiResponse.send(res, statusCode, { message });
  }

  static created(res, data) {
    return ApiResponse.send(res, 201, { data });
  }
}

module.exports = ApiResponse;

const logger = require("../utils/logger");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const started = Date.now();
  const path = req.originalUrl?.split("?")[0] ?? req.url;
  res.on("finish", () => {
    const ms = Date.now() - started;
    logger.info(`→ ${req.method} ${path} ${res.statusCode} (${ms}ms)`);
  });
  next();
}

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  logger.error(`❌ Unhandled error on ${req.method} ${req.originalUrl}`, err);
  if (res.headersSent) return;
  res.status(500).json({ error: err.message || "Internal server error" });
}

module.exports = { requestLogger, errorHandler };

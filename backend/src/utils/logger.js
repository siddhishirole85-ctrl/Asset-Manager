/**
 * @param {string} message
 */
function info(message) {
  console.log(message);
}

/**
 * @param {string} message
 */
function warn(message) {
  console.warn(message);
}

/**
 * @param {string} message
 * @param {unknown} [err]
 */
function error(message, err) {
  console.error(message, err ?? "");
}

/**
 * @param {import('express').Request} req
 */
function logRequestHandled(req) {
  const path = req.originalUrl?.split("?")[0] ?? req.url;
  info(`✅ API ${path} handled correctly (${req.method})`);
}

module.exports = { info, warn, error, logRequestHandled };

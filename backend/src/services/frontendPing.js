const logger = require("../utils/logger");

/**
 * @param {string} url
 * @returns {Promise<'connected'|'disconnected'>}
 */
async function pingFrontend(url) {
  const target = (url || "").replace(/\/+$/, "");
  if (!target) return "disconnected";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(target, { method: "GET", signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok || res.status === 304) return "connected";
    return "connected";
  } catch (e) {
    logger.warn(`⚠️ Frontend ping failed for ${target}: ${e instanceof Error ? e.message : String(e)}`);
    return "disconnected";
  }
}

module.exports = { pingFrontend };

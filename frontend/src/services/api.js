/**
 * @returns {string}
 */
export function getApiBase() {
  const raw = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return String(raw || "").replace(/\/+$/, "");
}

/**
 * @param {string} path
 */
export async function fetchBackendJson(path) {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

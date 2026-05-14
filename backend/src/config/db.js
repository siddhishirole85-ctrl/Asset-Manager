const { Pool } = require("pg");

let pool;

/**
 * @returns {import('pg').Pool}
 */
function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

/**
 * @param {string} text
 * @param {unknown[]} [params]
 */
async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res;
}

async function testConnection() {
  try {
    await query("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, query, testConnection, closePool };

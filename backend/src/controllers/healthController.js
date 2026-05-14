const db = require("../config/db");
const { pingFrontend } = require("../services/frontendPing");
const logger = require("../utils/logger");

async function getHealthSummary() {
  const dbOk = await db.testConnection();
  const database = dbOk ? "connected" : "disconnected";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const frontend = dbOk ? await pingFrontend(frontendUrl) : "disconnected";
  return {
    backend: "running",
    database,
    frontend,
  };
}

async function health(req, res) {
  const body = await getHealthSummary();
  if (body.database !== "connected") {
    logger.warn("❌ PostgreSQL is not reachable from /health");
  }
  res.json(body);
}

async function dbStatus(req, res) {
  res.json(await getHealthSummary());
}

async function dbTables(req, res) {
  const ok = await db.testConnection();
  if (!ok) {
    res.status(503).json({ error: "Database unavailable", database: "PostgreSQL" });
    return;
  }
  const { rows } = await db.query(
    `SELECT table_name AS name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
  );
  const out = [];
  for (const { name } of rows) {
    if (!/^[a-zA-Z0-9_]+$/.test(String(name))) continue;
    const c = await db.query(`SELECT COUNT(*)::int AS c FROM "${String(name)}"`);
    out.push({ name, rows: c.rows[0]?.c ?? 0 });
  }
  logger.info("✅ API /db-tables — listed PostgreSQL tables");
  res.json({ database: "PostgreSQL", tables: out });
}

async function dbDataStatus(req, res) {
  const ok = await db.testConnection();
  if (!ok) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }
  const { rows } = await db.query(
    `SELECT table_name AS name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
  );
  const tables = [];
  for (const { name } of rows) {
    if (!/^[a-zA-Z0-9_]+$/.test(String(name))) continue;
    const c = await db.query(`SELECT COUNT(*)::int AS c FROM "${String(name)}"`);
    const n = c.rows[0]?.c ?? 0;
    tables.push({ name, rows: n, hasData: n > 0 });
  }
  res.json({ database: "PostgreSQL", tables });
}

module.exports = { health, dbStatus, dbTables, dbDataStatus, getHealthSummary };

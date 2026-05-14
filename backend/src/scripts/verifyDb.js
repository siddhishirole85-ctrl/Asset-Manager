require("dotenv").config();
const db = require("../config/db");
const { initDatabase } = require("../services/databaseInit");

async function main() {
  await initDatabase();
  const ok = await db.testConnection();
  console.log(ok ? "✅ PostgreSQL connection OK" : "❌ PostgreSQL connection failed");
  const { rows } = await db.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`,
  );
  for (const r of rows) {
    const name = r.table_name;
    if (!/^[a-zA-Z0-9_]+$/.test(name)) continue;
    const c = await db.query(`SELECT COUNT(*)::int AS c FROM "${name}"`);
    console.log(`  ${name}: ${c.rows[0].c} rows`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

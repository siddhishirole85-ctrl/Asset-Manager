require("dotenv").config();
const app = require("./app");
const { initDatabase } = require("./services/databaseInit");
const db = require("./config/db");
const logger = require("./utils/logger");

const port = Number(process.env.PORT || 8080);

async function main() {
  try {
    await initDatabase();
    await db.testConnection();
    logger.info("✅ Data fetched successfully from PostgreSQL (startup check)");
  } catch (e) {
    logger.warn(
      "⚠️ Database init/connection failed — server will still start. APIs touching the DB will error until PostgreSQL is up.",
    );
    logger.warn(e instanceof Error ? e.message : String(e));
    logger.info("If PostgreSQL is not running on localhost:5432, start it. Windows: net start postgresql-x64-16 (service name may vary).");
  }

  app.listen(port, "0.0.0.0", () => {
    logger.info(`✅ Backend listening on http://localhost:${port}`);
  });
}

main();

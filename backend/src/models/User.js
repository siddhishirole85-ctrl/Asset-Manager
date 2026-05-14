const db = require("../config/db");
const { mapUser } = require("./mappers");
const logger = require("../utils/logger");

async function findByEmail(email) {
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  logger.info("✅ Data fetched successfully from PostgreSQL (users by email)");
  return rows[0] ?? null;
}

async function findById(id) {
  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  logger.info("✅ Data fetched successfully from PostgreSQL (users by id)");
  return rows[0] ?? null;
}

/**
 * @param {{ name: string, email: string, passwordHash: string, role?: string }} data
 */
async function createUser(data) {
  const role = data.role ?? "user";
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.name, data.email, data.passwordHash, role],
  );
  logger.info("✅ User stored in table: users");
  return rows[0];
}

async function listUsers() {
  const { rows } = await db.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY id ASC",
  );
  logger.info("✅ Data fetched successfully from PostgreSQL (users list)");
  return rows.map(mapUser);
}

module.exports = { findByEmail, findById, createUser, listUsers };

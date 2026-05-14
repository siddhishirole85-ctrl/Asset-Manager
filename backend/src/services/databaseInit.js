const bcrypt = require("bcryptjs");
const db = require("../config/db");
const logger = require("../utils/logger");

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  cover_color TEXT NOT NULL DEFAULT '#1e3a5f',
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS borrows (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  return_date TIMESTAMPTZ NOT NULL,
  actual_return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','returned','overdue')),
  return_location TEXT NOT NULL DEFAULT 'Main Library - Front Desk',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS borrows_user_id_idx ON borrows(user_id);
CREATE INDEX IF NOT EXISTS borrows_book_id_idx ON borrows(book_id);
CREATE INDEX IF NOT EXISTS borrows_status_idx ON borrows(status);
`;

async function ensureSchema() {
  await db.query(SCHEMA_SQL);
  await db.query(
    `ALTER TABLE borrows ADD COLUMN IF NOT EXISTS return_location TEXT NOT NULL DEFAULT 'Main Library - Front Desk'`,
  );
  logger.info("✅ PostgreSQL schema verified (users, books, borrows)");
}

async function seedIfEmpty() {
  const { rows: uc } = await db.query("SELECT COUNT(*)::int AS c FROM users");
  if (uc[0].c > 0) return;

  const hash = await bcrypt.hash("admin123", 10);
  await db.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin')`,
    ["Library Admin", "admin@library.local", hash],
  );
  logger.info("✅ User stored in table: users (seed admin)");

  const samples = [
    ["Clean Code", "Robert C. Martin", "Technology", "Pragmatic principles for maintainable software.", "Detailed guidance on naming, structure, error handling, and team practices.", "#1e3a5f", 3, 3],
    ["The Pragmatic Programmer", "David Thomas", "Technology", "Your journey to mastery.", "Timeless tips for thinking about code, tools, and careers.", "#2563eb", 2, 2],
    ["Dune", "Frank Herbert", "Science Fiction", "Desert planet, politics, and destiny.", "Epic world-building and ecological themes.", "#7c3aed", 2, 2],
    ["Atomic Habits", "James Clear", "Self-Development", "Tiny changes, remarkable results.", "Build systems instead of goals.", "#059669", 4, 4],
  ];
  for (const s of samples) {
    await db.query(
      `INSERT INTO books (title, author, category, short_description, full_description, cover_color, total_copies, available_copies, available)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, TRUE)`,
      s,
    );
  }
  logger.info("✅ Book stored in table: books (seed catalog)");
}

async function initDatabase() {
  await ensureSchema();
  await seedIfEmpty();
}

module.exports = { initDatabase, ensureSchema, seedIfEmpty };

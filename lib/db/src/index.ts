import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

const { Pool } = pg;

async function setupLibrarySchema(exec: (sql: string) => Promise<unknown>) {
  const safeExec = async (sql: string) => {
    try {
      await exec(sql);
    } catch (err: any) {
      const code = err?.code;
      const msg = String(err?.message ?? "");
      if (code === "42710" || msg.includes("already exists")) return;
      throw err;
    }
  };

  await safeExec(`CREATE TYPE user_role AS ENUM ('admin', 'user');`);
  await safeExec(`CREATE TYPE borrow_status AS ENUM ('issued', 'returned');`);

  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role user_role NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      isbn TEXT,
      total_copies INTEGER NOT NULL DEFAULT 1,
      available_copies INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS borrows (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      book_id INTEGER NOT NULL REFERENCES books(id),
      borrow_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      due_date TIMESTAMPTZ,
      return_date TIMESTAMPTZ,
      status borrow_status NOT NULL DEFAULT 'issued'
    );
  `);

  await exec(`
    INSERT INTO books (title, author, category, description, isbn, total_copies, available_copies)
    SELECT * FROM (VALUES
      ('The Pragmatic Programmer', 'Andrew Hunt', 'Programming', 'Classic software craftsmanship book.', '978-0201616224', 3, 3),
      ('Clean Code', 'Robert C. Martin', 'Programming', 'A handbook of agile software craftsmanship.', '978-0132350884', 2, 2),
      ('Atomic Habits', 'James Clear', 'Self-Help', 'An easy & proven way to build good habits.', '978-0735211292', 4, 4)
    ) AS v(title, author, category, description, isbn, total_copies, available_copies)
    WHERE NOT EXISTS (SELECT 1 FROM books);
  `);
}

type DbExports = {
  pool: pg.Pool | null;
  db: any;
};

const exportsObj: DbExports = process.env.DATABASE_URL
  ? (() => {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      return { pool, db: drizzleNodePg(pool, { schema }) };
    })()
  : await (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");

      // Persist a local dev DB inside the repo (gitignored by default).
      const dataDir = path.resolve(".local", "pglite");
      fs.mkdirSync(path.dirname(dataDir), { recursive: true });
      const client = await PGlite.create(dataDir);
      await setupLibrarySchema((sql) => client.exec(sql).then(() => undefined));

      return { pool: null, db: drizzlePglite({ client, schema }) };
    })();

export const pool = exportsObj.pool;
export const db = exportsObj.db;

export * from "./schema";

const db = require("../config/db");
const { mapBook } = require("./mappers");
const logger = require("../utils/logger");

/**
 * @param {{ category?: string, available?: boolean, search?: string }} filters
 */
async function listBooks(filters) {
  const clauses = [];
  const params = [];
  let i = 1;
  if (filters.category) {
    clauses.push(`category = $${i++}`);
    params.push(filters.category);
  }
  if (filters.available !== undefined && filters.available !== null) {
    clauses.push(`available = $${i++}`);
    params.push(filters.available);
  }
  if (filters.search) {
    const q = `%${filters.search}%`;
    clauses.push(`(title ILIKE $${i} OR author ILIKE $${i + 1})`);
    params.push(q, q);
    i += 2;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await db.query(`SELECT * FROM books ${where} ORDER BY id ASC`, params);
  logger.info("✅ Data fetched successfully from PostgreSQL (books list)");
  return rows.map(mapBook);
}

async function findById(id) {
  const { rows } = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  logger.info("✅ Data fetched successfully from PostgreSQL (book by id)");
  return rows[0] ? mapBook(rows[0]) : null;
}

/**
 * @param {object} input camelCase keys matching API
 */
async function createBook(input) {
  const { rows } = await db.query(
    `INSERT INTO books (title, author, category, short_description, full_description, cover_color, total_copies, available_copies, available)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      input.title,
      input.author,
      input.category,
      input.shortDescription ?? "",
      input.fullDescription ?? "",
      input.coverColor ?? "#1e3a5f",
      input.totalCopies ?? 1,
      input.totalCopies ?? 1,
      (input.totalCopies ?? 1) > 0,
    ],
  );
  logger.info("✅ Book stored in table: books");
  return mapBook(rows[0]);
}

async function updateBook(id, patch) {
  const currentRes = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  const current = currentRes.rows[0];
  if (!current) return null;

  const merged = {
    title: patch.title ?? current.title,
    author: patch.author ?? current.author,
    category: patch.category ?? current.category,
    short_description: patch.shortDescription ?? current.short_description,
    full_description: patch.fullDescription ?? current.full_description,
    cover_color: patch.coverColor ?? current.cover_color,
    total_copies: patch.totalCopies ?? current.total_copies,
  };

  let availableCopies = current.available_copies;
  if (patch.totalCopies !== undefined) {
    const diff = patch.totalCopies - current.total_copies;
    availableCopies = Math.max(0, current.available_copies + diff);
  }

  const available = availableCopies > 0;

  const { rows } = await db.query(
    `UPDATE books SET
      title = $1, author = $2, category = $3,
      short_description = $4, full_description = $5, cover_color = $6,
      total_copies = $7, available_copies = $8, available = $9
     WHERE id = $10 RETURNING *`,
    [
      merged.title,
      merged.author,
      merged.category,
      merged.short_description,
      merged.full_description,
      merged.cover_color,
      merged.total_copies,
      availableCopies,
      available,
      id,
    ],
  );
  logger.info("✅ Book updated in table: books");
  return rows[0] ? mapBook(rows[0]) : null;
}

async function deleteBook(id) {
  const { rows } = await db.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
  if (rows[0]) logger.info("✅ Book removed from table: books");
  return rows[0] ? mapBook(rows[0]) : null;
}

async function adjustCopies(bookId, delta) {
  await db.query(
    `UPDATE books SET available_copies = GREATEST(0, available_copies + $2), available = (GREATEST(0, available_copies + $2) > 0) WHERE id = $1`,
    [bookId, delta],
  );
}

async function findRawById(id) {
  const { rows } = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  return rows[0] ?? null;
}

module.exports = { listBooks, findById, createBook, updateBook, deleteBook, adjustCopies, findRawById };

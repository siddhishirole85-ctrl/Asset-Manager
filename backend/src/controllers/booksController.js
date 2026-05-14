const Book = require("../models/Book");
const db = require("../config/db");
const { buildRecommendations, enrichRecommendationList } = require("../services/recommendationService");
const logger = require("../utils/logger");

function parseBool(v) {
  if (v === undefined || v === null || v === "") return undefined;
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return undefined;
}

async function listBooks(req, res) {
  const filters = {
    category: req.query.category || undefined,
    available: parseBool(req.query.available),
    search: req.query.search || undefined,
  };
  const books = await Book.listBooks(filters);
  logger.info("✅ API /api/books working correctly (list)");
  res.json(books);
}

async function getBook(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const book = await Book.findById(id);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  logger.info("✅ API /api/books/:id working correctly (get)");
  res.json(book);
}

async function createBook(req, res) {
  const body = req.body ?? {};
  try {
    const book = await Book.createBook(body);
    logger.info("✅ Admin add book — INSERT books → FETCH → response");
    res.status(201).json(book);
  } catch (e) {
    logger.error("createBook failed", e);
    res.status(500).json({ error: "Could not create book" });
  }
}

async function updateBook(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const book = await Book.updateBook(id, req.body ?? {});
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  logger.info("✅ Book updated — table: books");
  res.json(book);
}

async function deleteBook(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const book = await Book.deleteBook(id);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.sendStatus(204);
}

async function getBookReason(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const book = await Book.findById(id);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  logger.info("✅ Recommendations / why-read flow — fetched book from PostgreSQL");
  res.json({
    bookId: book.id,
    why: `"${book.title}" by ${book.author} is a ${book.category} title that rewards careful reading and gives you practical mental models you can reuse.`,
    benefits: ["Deeper context than a summary alone", "Strong author voice and structure", "Ideas you can apply beyond the last page"],
    skills: ["Focused reading", "Critical thinking", "Domain vocabulary"],
  });
}

async function recommendationsPayload(userId) {
  const { rows: hist } = await db.query(
    `SELECT bk.category, bk.title, bk.id FROM borrows b INNER JOIN books bk ON bk.id = b.book_id WHERE b.user_id = $1 LIMIT 20`,
    [userId],
  );
  const borrowedCategories = [...new Set(hist.map((h) => h.category))];
  const borrowedBookIds = hist.map((h) => h.id);
  const { rows: allBooks } = await db.query("SELECT id, title, author, category, short_description FROM books ORDER BY id LIMIT 30");
  const candidates = allBooks.map((b) => ({
    id: b.id,
    title: b.title,
    category: b.category,
    recommendationTags: [b.category, "library pick"],
  }));
  const compact = buildRecommendations({
    candidates,
    borrowedCategories,
    interests: [],
    viewedBookIds: [],
    borrowedBookIds,
  });
  const candRows = allBooks.map((b) => ({ id: b.id, title: b.title, author: b.author, category: b.category }));
  const enriched = enrichRecommendationList(compact, candRows);
  logger.info("✅ Recommendations generated — read history + books tables");
  return enriched;
}

async function getBookRecommendations(req, res) {
  const list = await recommendationsPayload(req.user.userId);
  res.json(list);
}

async function getCompactRecommendations(req, res) {
  const full = await recommendationsPayload(req.user.userId);
  res.json({
    recommended: full.recommended.map((r) => ({ title: r.title, reason: r.reason })),
  });
}

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getBookReason,
  getBookRecommendations,
  getCompactRecommendations,
};

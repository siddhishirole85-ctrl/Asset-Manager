const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const logger = require("../utils/logger");

async function listBorrows(req, res) {
  const isAdmin = req.user.role === "admin";
  let rows = await Borrow.listBorrowsWithJoins(req.user.userId, isAdmin);
  const status = req.query.status;
  if (status) {
    rows = rows.filter((b) => b.status === status);
  }
  logger.info("✅ API /api/borrows working correctly (list)");
  res.json(rows);
}

async function createBorrow(req, res) {
  const bookId = Number(req.body?.bookId);
  if (Number.isNaN(bookId)) {
    res.status(400).json({ error: "bookId required" });
    return;
  }
  const returnDateRaw = req.body?.returnDate;
  const returnDate = returnDateRaw ? new Date(returnDateRaw) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const returnLocation = typeof req.body?.returnLocation === "string" ? req.body.returnLocation : undefined;

  const bookRow = await Book.findRawById(bookId);
  if (!bookRow) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  if (!bookRow.available || bookRow.available_copies <= 0) {
    res.status(409).json({ error: "Book not available for borrowing" });
    return;
  }

  const borrowRow = await Borrow.createBorrow({
    userId: req.user.userId,
    bookId,
    returnDate,
    returnLocation,
  });

  await Book.adjustCopies(bookId, -1);

  const updated = await Borrow.findBorrowJoin(borrowRow.id);
  logger.info("✅ Issue book flow — POST /api/borrows → INSERT borrows → UPDATE books → JOIN FETCH");
  res.status(201).json(updated);
}

async function returnBorrow(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const existing = await Borrow.findBorrowJoin(id);
  if (!existing) {
    res.status(404).json({ error: "Borrow not found" });
    return;
  }

  const isAdmin = req.user.role === "admin";
  if (!isAdmin && existing.userId !== req.user.userId) {
    res.status(403).json({ error: "Cannot return someone else's book" });
    return;
  }

  if (existing.status === "returned") {
    res.status(409).json({ error: "Book already returned" });
    return;
  }

  await Borrow.markReturned(id);
  await Book.adjustCopies(existing.bookId, 1);

  const updated = await Borrow.findBorrowJoin(id);
  logger.info("✅ Return book flow — PATCH /api/borrows/:id/return → UPDATE borrows → UPDATE books");
  res.json(updated);
}

module.exports = { listBorrows, createBorrow, returnBorrow };

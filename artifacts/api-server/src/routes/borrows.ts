import { Router, type IRouter } from "express";
import { db, borrowsTable, booksTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

async function getBorrowWithRelations(id: number) {
  const [borrow] = await db.select().from(borrowsTable).where(eq(borrowsTable.id, id));
  if (!borrow) return null;
  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, borrow.bookId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, borrow.userId));
  return {
    ...borrow,
    book: book ?? null,
    user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } : null,
  };
}

router.post("/borrows", requireAuth, async (req, res): Promise<void> => {
  const { bookId } = req.body as { bookId?: number };
  if (!bookId) { res.status(400).json({ error: "bookId is required" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bookId));
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  if (book.availableCopies <= 0) { res.status(400).json({ error: "No available copies" }); return; }

  const existingBorrow = await db
    .select()
    .from(borrowsTable)
    .where(and(eq(borrowsTable.userId, req.auth!.userId), eq(borrowsTable.bookId, bookId), eq(borrowsTable.status, "issued")));

  if (existingBorrow.length > 0) {
    res.status(400).json({ error: "You already have this book borrowed" });
    return;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  await db.update(booksTable).set({ availableCopies: book.availableCopies - 1 }).where(eq(booksTable.id, bookId));

  const [borrow] = await db
    .insert(borrowsTable)
    .values({ userId: req.auth!.userId, bookId, dueDate, status: "issued" })
    .returning();

  const result = await getBorrowWithRelations(borrow.id);
  res.status(201).json(result);
});

router.get("/borrows", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const borrows = await db.select().from(borrowsTable).orderBy(borrowsTable.borrowDate);
  const results = await Promise.all(borrows.map((b) => getBorrowWithRelations(b.id)));
  res.json(results.filter(Boolean));
});

router.get("/borrows/my", requireAuth, async (req, res): Promise<void> => {
  const borrows = await db
    .select()
    .from(borrowsTable)
    .where(eq(borrowsTable.userId, req.auth!.userId))
    .orderBy(borrowsTable.borrowDate);

  const results = await Promise.all(borrows.map((b) => getBorrowWithRelations(b.id)));
  res.json(results.filter(Boolean));
});

router.put("/borrows/:id/return", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [borrow] = await db.select().from(borrowsTable).where(eq(borrowsTable.id, id));
  if (!borrow) { res.status(404).json({ error: "Borrow record not found" }); return; }
  if (borrow.status === "returned") { res.status(400).json({ error: "Book already returned" }); return; }

  await db
    .update(borrowsTable)
    .set({ status: "returned", returnDate: new Date() })
    .where(eq(borrowsTable.id, id));

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, borrow.bookId));
  if (book) {
    await db.update(booksTable).set({ availableCopies: book.availableCopies + 1 }).where(eq(booksTable.id, borrow.bookId));
  }

  const result = await getBorrowWithRelations(id);
  res.json(result);
});

export default router;

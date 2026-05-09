import { Router, type IRouter } from "express";
import { db, booksTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/books/categories", async (_req, res): Promise<void> => {
  const rows = await db.selectDistinct({ category: booksTable.category }).from(booksTable).orderBy(booksTable.category);
  res.json(rows.map((r) => r.category));
});

router.get("/books", async (req, res): Promise<void> => {
  const { search, category } = req.query as { search?: string; category?: string };

  const conditions = [];
  if (search) {
    conditions.push(
      sql`(${ilike(booksTable.title, `%${search}%`)} OR ${ilike(booksTable.author, `%${search}%`)})`
    );
  }
  if (category) {
    conditions.push(eq(booksTable.category, category));
  }

  const books = conditions.length > 0
    ? await db.select().from(booksTable).where(and(...conditions)).orderBy(booksTable.title)
    : await db.select().from(booksTable).orderBy(booksTable.title);

  res.json(books);
});

router.get("/books/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.json(book);
});

router.post("/books", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { title, author, category, description, isbn, totalCopies } = req.body as {
    title?: string; author?: string; category?: string;
    description?: string; isbn?: string; totalCopies?: number;
  };

  if (!title || !author || !category || !totalCopies) {
    res.status(400).json({ error: "title, author, category, and totalCopies are required" });
    return;
  }

  const copies = Number(totalCopies);
  const [book] = await db
    .insert(booksTable)
    .values({ title, author, category, description, isbn, totalCopies: copies, availableCopies: copies })
    .returning();

  res.status(201).json(book);
});

router.put("/books/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { title, author, category, description, isbn, totalCopies } = req.body as {
    title?: string; author?: string; category?: string;
    description?: string; isbn?: string; totalCopies?: number;
  };

  const updateData: Record<string, unknown> = {};
  if (title) updateData.title = title;
  if (author) updateData.author = author;
  if (category) updateData.category = category;
  if (description !== undefined) updateData.description = description;
  if (isbn !== undefined) updateData.isbn = isbn;
  if (totalCopies !== undefined) {
    updateData.totalCopies = Number(totalCopies);
  }

  const [book] = await db.update(booksTable).set(updateData).where(eq(booksTable.id, id)).returning();
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.json(book);
});

router.delete("/books/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [book] = await db.delete(booksTable).where(eq(booksTable.id, id)).returning();
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  res.sendStatus(204);
});

export default router;

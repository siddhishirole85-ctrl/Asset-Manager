import { Router, type IRouter } from "express";
import { db, booksTable, usersTable, borrowsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const [bookStats] = await db
    .select({ total: count(), available: sql<number>`sum(${booksTable.availableCopies})` })
    .from(booksTable);

  const [userCount] = await db.select({ total: count() }).from(usersTable);

  const [borrowStats] = await db
    .select({ total: count() })
    .from(borrowsTable);

  const [activeBorrows] = await db
    .select({ total: count() })
    .from(borrowsTable)
    .where(eq(borrowsTable.status, "issued"));

  const now = new Date();
  const [overdueBorrows] = await db
    .select({ total: count() })
    .from(borrowsTable)
    .where(sql`${borrowsTable.status} = 'issued' AND ${borrowsTable.dueDate} < ${now}`);

  res.json({
    totalBooks: bookStats?.total ?? 0,
    totalUsers: userCount?.total ?? 0,
    activeBorrows: activeBorrows?.total ?? 0,
    totalBorrows: borrowStats?.total ?? 0,
    availableBooks: Number(bookStats?.available ?? 0),
    overdueBooks: overdueBorrows?.total ?? 0,
  });
});

export default router;

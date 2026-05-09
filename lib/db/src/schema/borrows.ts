import { pgTable, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const borrowStatusEnum = pgEnum("borrow_status", ["issued", "returned"]);

export const borrowsTable = pgTable("borrows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bookId: integer("book_id").notNull().references(() => booksTable.id),
  borrowDate: timestamp("borrow_date", { withTimezone: true }).notNull().defaultNow(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  returnDate: timestamp("return_date", { withTimezone: true }),
  status: borrowStatusEnum("status").notNull().default("issued"),
});

export const insertBorrowSchema = createInsertSchema(borrowsTable).omit({ id: true });
export type InsertBorrow = z.infer<typeof insertBorrowSchema>;
export type Borrow = typeof borrowsTable.$inferSelect;

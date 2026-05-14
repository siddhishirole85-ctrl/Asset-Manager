const db = require("../config/db");
const logger = require("../utils/logger");

async function stats(req, res) {
  const userId = req.user.userId;
  const now = new Date();

  const { rows: bookAgg } = await db.query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN available THEN 1 ELSE 0 END),0)::int AS available
     FROM books`,
  );
  const { rows: userCount } = await db.query(`SELECT COUNT(*)::int AS c FROM users`);
  const { rows: borrows } = await db.query(
    `SELECT user_id, status, return_date, actual_return_date FROM borrows`,
  );

  const activeOut = borrows.filter((b) => !b.actual_return_date && b.status !== "returned");
  const borrowedBooks = activeOut.length;

  const overdueCount = activeOut.filter((b) => new Date(b.return_date) < now).length;

  const mine = borrows.filter((b) => b.user_id === userId);
  const myOut = mine.filter((b) => !b.actual_return_date && b.status !== "returned");
  const myOverdueBorrows = myOut.filter((b) => new Date(b.return_date) < now).length;
  const myActiveBorrows = myOut.filter((b) => new Date(b.return_date) >= now).length;

  logger.info("✅ Data fetched successfully from PostgreSQL (dashboard stats)");
  res.json({
    totalBooks: bookAgg[0]?.total ?? 0,
    availableBooks: bookAgg[0]?.available ?? 0,
    borrowedBooks,
    totalUsers: userCount[0]?.c ?? 0,
    overdueCount,
    myActiveBorrows,
    myOverdueBorrows,
  });
}

async function activity(req, res) {
  const { rows } = await db.query(
    `
    SELECT b.id, b.status, b.issue_date, b.return_date, b.actual_return_date, b.user_id,
           u.name AS user_name, bk.title AS book_title
    FROM borrows b
    INNER JOIN users u ON u.id = b.user_id
    INNER JOIN books bk ON bk.id = b.book_id
    ORDER BY b.created_at DESC
    LIMIT 40
    `,
  );

  const now = new Date();
  const isAdmin = req.user.role === "admin";

  const mapped = rows
    .map((row) => {
      let type;
      let description;
      if (row.actual_return_date) {
        type = "return";
        description = `${row.user_name} returned "${row.book_title}"`;
      } else if ((row.status === "active" || row.status === "overdue") && new Date(row.return_date) < now) {
        type = "overdue";
        description = `${row.user_name}'s copy of "${row.book_title}" is overdue`;
      } else {
        type = "borrow";
        description = `${row.user_name} borrowed "${row.book_title}"`;
      }
      return {
        id: row.id,
        type,
        description,
        createdAt: new Date(row.actual_return_date ?? row.issue_date).toISOString(),
        userName: row.user_name,
        bookTitle: row.book_title,
        userId: row.user_id,
      };
    })
    .filter((item) => isAdmin || item.userId === req.user.userId)
    .map(({ userId, ...rest }) => rest);

  logger.info("✅ Data fetched successfully from PostgreSQL (dashboard activity)");
  res.json(mapped);
}

module.exports = { stats, activity };

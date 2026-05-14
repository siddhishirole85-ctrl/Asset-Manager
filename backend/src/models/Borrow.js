const db = require("../config/db");
const { mapBorrow } = require("./mappers");
const logger = require("../utils/logger");

async function listBorrowsWithJoinsFixed(forUserId, isAdmin) {
  let sql = `
    SELECT
      b.id, b.user_id, b.book_id, b.issue_date, b.return_date, b.actual_return_date, b.status, b.return_location, b.created_at,
      bk.id AS bid, bk.title AS btitle, bk.author AS bauthor, bk.category AS bcategory,
      bk.short_description AS bsd, bk.full_description AS bfd, bk.cover_color AS bcc,
      bk.total_copies AS btc, bk.available_copies AS bac, bk.available AS bav, bk.created_at AS bcat,
      u.id AS uid, u.name AS uname, u.email AS uemail, u.role AS urole, u.created_at AS ucat
    FROM borrows b
    INNER JOIN books bk ON bk.id = b.book_id
    INNER JOIN users u ON u.id = b.user_id
  `;
  const params = [];
  if (!isAdmin) {
    sql += " WHERE b.user_id = $1";
    params.push(forUserId);
  }
  sql += " ORDER BY b.created_at DESC";
  const { rows } = await db.query(sql, params);
  logger.info("✅ Data fetched successfully from PostgreSQL (borrows list)");
  return rows.map((r) =>
    mapBorrow(
      {
        id: r.id,
        user_id: r.user_id,
        book_id: r.book_id,
        issue_date: r.issue_date,
        return_date: r.return_date,
        actual_return_date: r.actual_return_date,
        status: r.status,
        return_location: r.return_location,
        created_at: r.created_at,
      },
      {
        id: r.bid,
        title: r.btitle,
        author: r.bauthor,
        category: r.bcategory,
        short_description: r.bsd,
        full_description: r.bfd,
        cover_color: r.bcc,
        total_copies: r.btc,
        available_copies: r.bac,
        available: r.bav,
        created_at: r.bcat,
      },
      {
        id: r.uid,
        name: r.uname,
        email: r.uemail,
        role: r.urole,
        created_at: r.ucat,
      },
    ),
  );
}

async function findBorrowJoin(id) {
  const { rows } = await db.query(
    `
    SELECT
      b.id, b.user_id, b.book_id, b.issue_date, b.return_date, b.actual_return_date, b.status, b.return_location, b.created_at,
      bk.id AS bid, bk.title AS btitle, bk.author AS bauthor, bk.category AS bcategory,
      bk.short_description AS bsd, bk.full_description AS bfd, bk.cover_color AS bcc,
      bk.total_copies AS btc, bk.available_copies AS bac, bk.available AS bav, bk.created_at AS bcat,
      u.id AS uid, u.name AS uname, u.email AS uemail, u.role AS urole, u.created_at AS ucat
    FROM borrows b
    INNER JOIN books bk ON bk.id = b.book_id
    INNER JOIN users u ON u.id = b.user_id
    WHERE b.id = $1
    `,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  return mapBorrow(
    {
      id: r.id,
      user_id: r.user_id,
      book_id: r.book_id,
      issue_date: r.issue_date,
      return_date: r.return_date,
      actual_return_date: r.actual_return_date,
      status: r.status,
      return_location: r.return_location,
      created_at: r.created_at,
    },
    {
      id: r.bid,
      title: r.btitle,
      author: r.bauthor,
      category: r.bcategory,
      short_description: r.bsd,
      full_description: r.bfd,
      cover_color: r.bcc,
      total_copies: r.btc,
      available_copies: r.bac,
      available: r.bav,
      created_at: r.bcat,
    },
    {
      id: r.uid,
      name: r.uname,
      email: r.uemail,
      role: r.urole,
      created_at: r.ucat,
    },
  );
}

/**
 * @param {{ userId: number, bookId: number, returnDate: Date, returnLocation?: string }} data
 */
async function createBorrow(data) {
  const loc = data.returnLocation ?? "Main Library - Front Desk";
  const { rows } = await db.query(
    `INSERT INTO borrows (user_id, book_id, issue_date, return_date, status, return_location)
     VALUES ($1,$2,NOW(),$3,'active',$4) RETURNING *`,
    [data.userId, data.bookId, data.returnDate, loc],
  );
  logger.info("✅ Issued book stored in table: borrows");
  return rows[0];
}

async function markReturned(borrowId) {
  const { rows } = await db.query(
    `UPDATE borrows SET status = 'returned', actual_return_date = NOW() WHERE id = $1 RETURNING *`,
    [borrowId],
  );
  if (rows[0]) logger.info("✅ Borrow returned — updated table: borrows");
  return rows[0] ?? null;
}

async function syncOverdueStatus() {
  const { rowCount } = await db.query(
    `UPDATE borrows SET status = 'overdue' WHERE status = 'active' AND return_date < NOW()`,
  );
  if (rowCount > 0) {
    logger.info(`✅ Overdue records updated in table: borrows (${rowCount} rows)`);
  }
  return rowCount;
}

module.exports = {
  listBorrowsWithJoins: listBorrowsWithJoinsFixed,
  findBorrowJoin,
  createBorrow,
  markReturned,
  syncOverdueStatus,
};

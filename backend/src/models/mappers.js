/**
 * @param {Record<string, unknown>} row
 */
function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * @param {Record<string, unknown>} row
 */
function mapBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    available: row.available,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    coverColor: row.cover_color,
    totalCopies: row.total_copies,
    availableCopies: row.available_copies,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

/**
 * @param {Record<string, unknown>} borrow
 * @param {Record<string, unknown>} book
 * @param {Record<string, unknown>} user
 */
function mapBorrow(borrow, book, user) {
  const now = new Date();
  let status = borrow.status;
  if (status === "active" && now > new Date(borrow.return_date)) {
    status = "overdue";
  }
  return {
    id: borrow.id,
    userId: borrow.user_id,
    bookId: borrow.book_id,
    issueDate: new Date(borrow.issue_date).toISOString(),
    returnDate: new Date(borrow.return_date).toISOString(),
    actualReturnDate: borrow.actual_return_date ? new Date(borrow.actual_return_date).toISOString() : null,
    status,
    returnLocation: borrow.return_location,
    book: mapBook(book),
    user: mapUser(user),
  };
}

module.exports = { mapUser, mapBook, mapBorrow };

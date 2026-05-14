const express = require("express");
const authController = require("../controllers/authController");
const booksController = require("../controllers/booksController");
const borrowsController = require("../controllers/borrowsController");
const dashboardController = require("../controllers/dashboardController");
const usersController = require("../controllers/usersController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.get("/auth/me", requireAuth, authController.me);

router.get("/books/recommendations", requireAuth, booksController.getBookRecommendations);
router.get("/books", requireAuth, booksController.listBooks);
router.post("/books", requireAuth, requireAdmin, booksController.createBook);
router.get("/books/:id/reason", requireAuth, booksController.getBookReason);
router.get("/books/:id", requireAuth, booksController.getBook);
router.patch("/books/:id", requireAuth, requireAdmin, booksController.updateBook);
router.delete("/books/:id", requireAuth, requireAdmin, booksController.deleteBook);

router.get("/recommendations", requireAuth, booksController.getCompactRecommendations);

router.get("/borrows", requireAuth, borrowsController.listBorrows);
router.post("/borrows", requireAuth, borrowsController.createBorrow);
router.patch("/borrows/:id/return", requireAuth, borrowsController.returnBorrow);

router.get("/users", requireAuth, requireAdmin, usersController.listUsers);

router.get("/dashboard/stats", requireAuth, dashboardController.stats);
router.get("/dashboard/activity", requireAuth, dashboardController.activity);

module.exports = router;

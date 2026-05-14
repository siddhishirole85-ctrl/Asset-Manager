const jwt = require("jsonwebtoken");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }
  try {
    const payload = jwt.verify(token, secret);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

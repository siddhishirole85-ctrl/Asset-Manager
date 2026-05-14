const User = require("../models/User");
const logger = require("../utils/logger");

async function listUsers(_req, res) {
  const users = await User.listUsers();
  logger.info("✅ API /api/users working correctly");
  res.json(users);
}

module.exports = { listUsers };

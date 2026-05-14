const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { mapUser } = require("../models/mappers");
const logger = require("../utils/logger");

function signToken(userId, role) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  return jwt.sign({ userId, role }, secret, { expiresIn: "7d" });
}

async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  const user = await User.findByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken(user.id, user.role);
  logger.info(`✅ API /api/auth/login — user ${user.id} authenticated`);
  res.json({ token, user: mapUser(user) });
}

async function register(req, res) {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password required" });
    return;
  }
  const existing = await User.findByEmail(email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.createUser({ name, email, passwordHash, role: "user" });
  const token = signToken(user.id, user.role);
  logger.info("✅ User registered — flow: Frontend Form → POST /api/auth/register → Controller → INSERT users → FETCH user → response");
  res.status(201).json({ token, user: mapUser(user) });
}

async function me(req, res) {
  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  logger.info("✅ API /api/auth/me working correctly");
  res.json(mapUser(user));
}

module.exports = { login, register, me };

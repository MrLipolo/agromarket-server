import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Поля name, email и password обязательны' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть не короче 8 символов' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [String(name).trim(), String(email).trim().toLowerCase(), passwordHash]
    );
    const user = rows[0];

    res.status(201).json({ user, token: createToken(user) });
  } catch (err) {
    // 23505 — уникальный ключ уже существует в PostgreSQL (дубликат email)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Поля email и password обязательны' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [String(email).trim().toLowerCase()]
    );
    const user = rows[0];

    const ok = user && (await bcrypt.compare(String(password), user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token: createToken(safeUser) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
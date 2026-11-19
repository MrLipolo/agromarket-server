import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchema, productUpdateSchema } from '../validation/schemas.js';
import { idParam } from '../middleware/idParam.js';

const router = Router();
// Цепочка middleware: сначала проверяем токен, затем роль админа
const adminOnly = [requireAuth, requireRole('admin')];

// GET /api/products — доступен ВСЕМ
router.get('/', async (req, res) => {
  const search = req.query.search || '';
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE name ILIKE $1 ORDER BY id',
    [`%${search}%`]
  );
  res.json(rows);
});

// GET /api/products/:id — доступен ВСЕМ
router.get('/:id', idParam, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
  res.json(rows[0]);
});

// POST /api/products — только для ADMIN
router.post('/', adminOnly, validate(productSchema), async (req, res) => {
  const body = req.body;

  const { name, category, price, unit, image } = body;
  const { rows } = await pool.query(
    `INSERT INTO products (name, category, price, unit, image)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, category ?? null, Number(price), unit ?? 'кг', image ?? null]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/products/:id — только для ADMIN
router.put('/:id', adminOnly, idParam, validate(productUpdateSchema), async (req, res) => {
  const body = req.body;
  const current = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (current.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
  const merged = { ...current.rows[0], ...body };
  const { name, category, price, unit, image } = merged;
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $1, category = $2, price = $3, unit = $4, image = $5
     WHERE id = $6 RETURNING *`,
    [name, category ?? null, Number(price), unit ?? 'кг', image ?? null, req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
  res.json(rows[0]);
});

// DELETE /api/products/:id — только для ADMIN
router.delete('/:id', adminOnly, idParam, async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Товар не найден' });
  res.status(204).end();
});

export default router;

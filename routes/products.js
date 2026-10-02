import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

function validateProduct(body) {
  const { name, price } = body;
  if (!name || !String(name).trim()) return 'Поле name обязательно';
  const n = Number(price);
  if (price === undefined || price === '' || !Number.isInteger(n) || n < 0) {
    return 'Поле price должно быть целым числом ≥ 0';
  }
  return null;
}

// GET /api/products (?search=)
router.get('/', async (req, res) => {
  const search = req.query.search || '';
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE name ILIKE $1 ORDER BY id',
    [`%${search}%`]
  );
  res.json(rows);
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(rows[0]);
});

// POST /api/products
router.post('/', async (req, res) => {
  const body = req.body || {};
  const error = validateProduct(body);
  if (error) return res.status(400).json({ error });

  const { name, category, price, unit, image } = body;
  const { rows } = await pool.query(
    `INSERT INTO products (name, category, price, unit, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, category ?? null, Number(price), unit ?? 'кг', image ?? null]
  );

  res.status(201).json(rows[0]);
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  const body = req.body || {};
  const error = validateProduct(body);
  if (error) return res.status(400).json({ error });

  const { name, category, price, unit, image } = body;
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $1, category = $2, price = $3, unit = $4, image = $5
     WHERE id = $6
     RETURNING *`,
    [name, category ?? null, Number(price), unit ?? 'кг', image ?? null, req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(rows[0]);
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM products WHERE id = $1',
    [req.params.id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.status(204).end();
});

export default router;
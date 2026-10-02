import { Router } from 'express';
import { products } from '../data/products.js';

const router = Router();

// GET /api/products (с фильтрацией по ?search=)
router.get('/', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search)
  );

  res.json(filteredProducts);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find((p) => String(p.id) === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(product);
});

export default router;
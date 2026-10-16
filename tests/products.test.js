import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Каталог: публичный доступ', () => {
  it('GET /api/products возвращает непустой список', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('у товара есть id, name и price', async () => {
    const res = await request(app).get('/api/products');
    const product = res.body[0];

    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
  });

  it('несуществующий товар — 404', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
  });

  it('GET /api/products/:id возвращает конкретный товар по id', async () => {
    const listRes = await request(app).get('/api/products');
    const first = listRes.body[0];

    const itemRes = await request(app).get(`/api/products/${first.id}`);
    expect(itemRes.status).toBe(200);
    expect(itemRes.body.name).toBe(first.name);
  });
});
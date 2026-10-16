import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { getUserToken, getAdminToken } from './helpers.js';

const newProduct = { name: 'Тестовый мёд', category: 'Мёд', price: 2500, unit: 'кг' };

describe('Изменение каталога: только admin', () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    userToken = await getUserToken();
    adminToken = await getAdminToken();
  });

  it('без токена — 401', async () => {
    const res = await request(app).post('/api/products').send(newProduct);
    expect(res.status).toBe(401);
  });

  it('покупатель (обычный пользователь) — 403', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newProduct);
    expect(res.status).toBe(403);
  });

  it('поддельный токен — 401', async () => {
    const fakeToken = jwt.sign({ sub: '1', role: 'admin' }, 'fake-secret');
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send(newProduct);
    expect(res.status).toBe(401);
  });

  it('администратор: полный цикл CRUD', async () => {
    const auth = `Bearer ${adminToken}`;

    const created = await request(app)
      .post('/api/products')
      .set('Authorization', auth)
      .send(newProduct);
    expect(created.status).toBe(201);
    const id = created.body.id;

    const updated = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', auth)
      .send({ ...newProduct, price: 2700 });
    expect(updated.status).toBe(200);

    const deleted = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', auth);
    expect(deleted.status).toBe(204);
  });
});
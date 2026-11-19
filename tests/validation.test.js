import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getAdminToken, uniqueEmail } from './helpers.js';

describe('Валидация входных данных', () => {
  it('отклоняет некорректный email при регистрации', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Тест', email: 'не-почта', password: '12345678' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((detail) => detail.field)).toContain('email');
  });

  it('отклоняет пароль короче 8 символов', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Тест', email: uniqueEmail(), password: '1234567' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((detail) => detail.field)).toContain('password');
  });

  it('игнорирует role: admin при регистрации', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Хакер', email: uniqueEmail('mass'), password: '12345678', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
  });

  it('отклоняет товар с отрицательной ценой', async () => {
    const token = await getAdminToken();
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Мёд', price: -500, category: 'Мёд' });
    expect(res.status).toBe(400);
  });

  it('отклоняет цену выше допустимого предела', async () => {
    const token = await getAdminToken();
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Мёд', price: 10_000_001 });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 для нечислового id товара', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(400);
  });

  it('отклоняет пустое тело обновления товара', async () => {
    const token = await getAdminToken();
    const res = await request(app).put('/api/products/1').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it('возвращает 413 для тела больше 100 КБ', async () => {
    const res = await request(app).post('/api/auth/register').send({ data: 'x'.repeat(200_000) });
    expect(res.status).toBe(413);
  });
});

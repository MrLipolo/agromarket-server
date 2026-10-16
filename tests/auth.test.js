import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { uniqueEmail } from './helpers.js';

describe('POST /api/auth/register', () => {
  it('создаёт покупателя и возвращает токен', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Айгерим', email: uniqueEmail(), password: 'qwerty123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('user');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('защита от mass assignment: не даёт стать админом через тело запроса', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Хакер', email: uniqueEmail(), password: 'qwerty123', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
  });

  it('повторный e-mail — 409', async () => {
    const body = { name: 'Дубль', email: uniqueEmail(), password: 'qwerty123' };
    await request(app).post('/api/auth/register').send(body);
    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('админ входит и получает JWT токен', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.user.role).toBe('admin');
  });

  it('неверный пароль — 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });
});
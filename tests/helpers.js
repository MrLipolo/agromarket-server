import request from 'supertest';
import app from '../app.js';

export function uniqueEmail(prefix = 'user') {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}@test.kz`;
}

export async function getUserToken() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Тестовый покупатель', email: uniqueEmail(), password: 'qwerty123' });
  return res.body.token;
}

export async function getAdminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  return res.body.token;
}
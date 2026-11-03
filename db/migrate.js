import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
     id            SERIAL PRIMARY KEY,
     name          TEXT NOT NULL,
     email         TEXT NOT NULL UNIQUE,
     password_hash TEXT NOT NULL,
     role          TEXT NOT NULL DEFAULT 'user',
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS products (
     id          SERIAL PRIMARY KEY,
     name        TEXT NOT NULL,
     category    TEXT NOT NULL,
     price       NUMERIC(10, 2) NOT NULL,
     unit        TEXT NOT NULL,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS orders (
     id          SERIAL PRIMARY KEY,
     user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
     status      TEXT NOT NULL DEFAULT 'pending',
     total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`
];

async function migrate() {
  for (const sql of statements) {
    await pool.query(sql);
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Администратор', $1, $2, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [ADMIN_EMAIL.toLowerCase(), hash]
    );
  }
  console.log(`Миграция выполнена (инструкций: ${statements.length})`);
}

migrate()
  .catch((err) => {
    console.error('Миграция не удалась:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';
import path from 'node:path';

export default function setup() {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

  const target = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agromarket_test';

  console.log('Подключение к тестовой БД:', target);

  execSync('npm run db:init', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: target }
  });
}
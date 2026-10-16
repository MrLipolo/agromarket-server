import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'node:path';

const envConfig = dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

const testEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: envConfig.parsed?.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agromarket_test',
  JWT_SECRET: envConfig.parsed?.JWT_SECRET || 'test-secret-only-for-local-tests',
  JWT_EXPIRES_IN: '2h',
  ADMIN_EMAIL: envConfig.parsed?.ADMIN_EMAIL || 'admin@test.kz',
  ADMIN_PASSWORD: envConfig.parsed?.ADMIN_PASSWORD || 'Admin12345',
  CORS_ORIGIN: 'http://localhost:5173'
};

export default defineConfig({
  test: {
    env: testEnv,
    globalSetup: './tests/globalSetup.js',
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
    coverage: {
      include: ['app.js', 'routes/**', 'middleware/**'],
    },
  },
});
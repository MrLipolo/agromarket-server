import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './db/pool.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

// Проверка наличия секретного ключа перед запуском
if (!process.env.JWT_SECRET) {
  console.error('Не задан JWT_SECRET в .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Защитные заголовки, CORS и ограничение размера тела запроса (10 КБ)
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use(logger);

// Проверка работоспособности сервера и БД
app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
});

// Маршруты API
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Обработка несуществующих маршрутов (404)
app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
});

// Централизованный обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API запущен: http://localhost:${PORT}`);
});
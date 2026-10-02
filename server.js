import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(logger);

// Вспомогательные маршруты
app.get('/', (req, res) => {
  res.send('АгроМаркет API работает');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/about', (req, res) => {
  res.json({
    name: 'АгроМаркет',
    version: '1.0',
    author: 'Гончаров Константин'
  });
});

// Маршруты API через Router
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Обработка несуществующих маршрутов (404)
app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
});

app.listen(PORT, () => {
  console.log(`API запущен: http://localhost:${PORT}`);
});
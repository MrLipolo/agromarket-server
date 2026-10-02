import pg from 'pg';

// Сохраняем формат даты YYYY-MM-DD без смещения часовых поясов
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
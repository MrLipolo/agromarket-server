import jwt from 'jsonwebtoken';

// Проверка наличия и валидности JWT-токена
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Требуется вход в систему' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch (err) {
    const error = err.name === 'TokenExpiredError'
      ? 'Срок действия токена истёк, войдите снова'
      : 'Недействительный токен';
    return res.status(401).json({ error });
  }
}

// Проверка роли пользователя (например, admin)
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
}
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Имя — минимум 2 символа').max(100),
  email: z.string().trim().toLowerCase().email('Некорректный e-mail'),
  password: z.string().min(8, 'Пароль — минимум 8 символов').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Некорректный e-mail'),
  password: z.string().min(1, 'Введите пароль').max(72),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Название — минимум 2 символа').max(200),
  category: z.string().trim().max(50).optional().transform((value) => value || undefined),
  price: z.coerce.number().positive('Цена должна быть больше 0').max(10_000_000),
  unit: z.string().trim().min(1).max(20).optional().transform((value) => value || undefined),
  image: z.string().trim().max(2048).optional().transform((value) => value || undefined),
});

export const productUpdateSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Нет полей для обновления');

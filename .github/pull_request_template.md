## Что сделано
- Настроены автотесты на Vitest + Supertest
- Разделен сервер на app.js и server.js
- Настроен CI с тестами в GitHub Actions

## Как проверить
1. `npm ci`
2. Создать базу `agromarket_test`
3. `npm test`

## Чек-лист автора
- [x] `npm test` проходит локально
- [x] В коммитах нет `.env`, `.env.test`, `coverage/`
- [x] README обновлён
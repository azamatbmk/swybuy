# SwyBuy

Витрина склада + Nest API. Старое Expo-приложение в `swybuy_front` не используется.

## Запуск

В двух терминалах из этой папки:

```bash
npm run db:setup
npm run dev:api
npm run dev:web
```

- сайт: http://localhost:3000
- api: http://localhost:4000/health
- витрина автора: http://localhost:3000/a/masha
- админка: http://localhost:3000/admin  
  ключ из `api/.env` (`ADMIN_KEY`, по умолчанию `changeme`)

Оплата пока тестовая (`PAYMENT_MODE=mock`). ЮKassa: ключи в `api/.env` и `PAYMENT_MODE=yookassa`.

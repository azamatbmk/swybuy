# Выкладка SwyBuy на Timeweb

Сайт и API живут на **одном** облачном сервере. Домен указывает на этот сервер. API снаружи не открываем: браузер ходит на `https://домен/backend/…`.

Замените `your-domain.ru` на ваш домен везде, где он встречается.

## 1. Сервер в Timeweb Cloud

1. Войдите на [timeweb.cloud](https://timeweb.cloud).
2. **Облачные серверы** → **Создать**.
3. Образ: **Ubuntu 24.04**.
4. Конфиг: от **1 vCPU / 2 GB RAM**, диск от 20 GB. Регион — Москва или СПб, что ближе.
5. Сеть: публичный IPv4.
6. Вход: **SSH-ключ** (лучше) или пароль root. Ключ — из PuTTY/Windows «Параметры → SSH → ключи».
7. Создать сервер, подождать статус **Online**.
8. Скопировать **IPv4** с карточки сервера.

Обычный «хостинг сайтов» Timeweb (PHP) не используйте.

## 2. Домен на IP сервера

IP сервера — тот, что скопировали. TTL можно 300–600 секунд.

### Если домен в классическом Timeweb (hosting.timeweb.ru)

1. **Домены** → ваш домен → **DNS-записи** (или «Редактировать DNS»).
2. Запись **A**, имя `@` (или пустое), значение = IP сервера.
3. Запись **A**, имя `www`, значение = тот же IP.
4. Старые A/AAAA на другой хостинг — удалить.
5. CNAME `www` на другой адрес — убрать, если мешает A для `www`.

### Если DNS в Timeweb Cloud

1. **Домены** → домен → DNS.
2. Те же две **A**-записи: `@` и `www` → IP сервера.

Проверка с компьютера (PowerShell):

```powershell
nslookup your-domain.ru
```

Должен показаться IP сервера. Иногда 10–30 минут.

## 3. Первый вход на сервер

С Windows удобно **Windows Terminal** или PuTTY:

```powershell
ssh root@IP_СЕРВЕРА
```

Дальше все команды — **на сервере**.

```bash
apt update && apt install -y nginx git curl ufw
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# certbot после того, как DNS уже смотрит на этот IP
apt install -y certbot python3-certbot-nginx
```

## 4. Код и переменные

Репозиторий должен быть на GitHub (или залейте архивом в `/var/www/swybuy`).

```bash
mkdir -p /var/www
git clone https://github.com/azamatbmk/swybuy.git /var/www/swybuy
cd /var/www/swybuy
```

Если репозиторий закрытый — SSH-ключ на сервере и clone по `git@github.com:…`.

Скопируйте шаблон API-окружения:

```bash
cp /var/www/swybuy/deploy/api.env.example /var/www/swybuy/api/.env
nano /var/www/swybuy/api/.env
```

В `.env` обязательно:

- `WEB_ORIGIN="https://your-domain.ru"` — без `www`, если редирект будет на голый домен (или наоборот, но **один** канонический адрес).
- `ADMIN_KEY` — длинная случайная строка, не как на компьютере. Например:

```bash
openssl rand -hex 32
```

Карту не заполняйте: `YOOKASSA_*` можно оставить пустыми.

## 5. Сборка

Один раз создаёт базу и (по желанию) стартовый каталог:

```bash
cd /var/www/swybuy/api
npm ci
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build
```

`db seed` затирает товары в **пустой** базе шаблоном. На уже живом сайте **не запускайте**.

Сайт. `NEXT_PUBLIC_API_URL` нужен **в момент сборки**:

```bash
cd /var/www/swybuy/web
npm ci
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000 npm run build
```

## 6. PM2

```bash
cd /var/www/swybuy
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd
```

Последняя команда напечатает строку `sudo env PATH=…` — её нужно выполнить один раз.

Проверка:

```bash
curl -s http://127.0.0.1:4000/health
curl -sI http://127.0.0.1:3000
pm2 status
```

## 7. Nginx

Скопируйте конфиг и замените домен (оба вхождения `your-domain.ru`, включая `www`):

```bash
cp /var/www/swybuy/deploy/nginx.conf /etc/nginx/sites-available/swybuy
nano /etc/nginx/sites-available/swybuy
ln -sf /etc/nginx/sites-available/swybuy /etc/nginx/sites-enabled/swybuy
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Пока DNS дошёл, сайт может открываться по `http://IP`. Когда `nslookup` показывает IP сервера:

```bash
certbot --nginx -d your-domain.ru -d www.your-domain.ru
```

Согласитесь на редирект HTTP → HTTPS.

## 8. Проверка в браузере

- `https://your-domain.ru` — витрина
- заказ: имя + телефон
- `https://your-domain.ru/admin` — ключ из `api/.env`
- `https://your-domain.ru/a/masha` — витрина блогера, если сид уже был

Если админка не пускает: `WEB_ORIGIN` должен быть именно `https://…` (тот адрес, что в строке браузера), и `TRUST_PROXY=1`.

## Обновление кода потом

```bash
cd /var/www/swybuy
git pull
cd api && npm ci && npx prisma generate && npx prisma db push && npm run build
cd ../web && npm ci && NEXT_PUBLIC_API_URL=http://127.0.0.1:4000 npm run build
pm2 restart all
```

`prisma db push` обновляет схему, **не** удаляет заказы. `db seed` не трогайте.

База: `/var/www/swybuy/api/prisma/prod.db`. Скачивайте копию время от времени:

```bash
cp /var/www/swybuy/api/prisma/prod.db /root/swybuy-prod-$(date +%F).db
```

С Windows можно забрать так:

```powershell
scp root@IP_СЕРВЕРА:/var/www/swybuy/api/prisma/prod.db .\prod.db
```

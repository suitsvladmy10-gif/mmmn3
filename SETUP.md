# Инструкция по настройке

## Проблема с npm кешем

Если при установке зависимостей возникает ошибка с правами доступа к кешу npm, выполните:

```bash
sudo chown -R $(whoami) ~/.npm
```

Или очистите кеш:
```bash
sudo rm -rf ~/.npm/_cacache
```

## Шаги настройки

### 1. Установка зависимостей

```bash
npm install
```

Если возникают проблемы, попробуйте:
```bash
npm install --legacy-peer-deps
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
# Сгенерируйте секрет командой: openssl rand -base64 32
NEXTAUTH_SECRET="ВАШ_СЕКРЕТНЫЙ_КЛЮЧ_ЗДЕСЬ"
NEXTAUTH_URL="http://localhost:3000"

# Yandex Vision API
# Получите ключ на https://cloud.yandex.ru/
YANDEX_VISION_API_KEY="ВАШ_YANDEX_VISION_API_KEY"
# Опционально
YANDEX_FOLDER_ID=""

# Gemini (опционально, для AI парсинга и категоризации)
# Получите ключ на https://ai.google.dev/gemini-api/docs/api-key
GEMINI_API_KEY="ВАШ_GEMINI_API_KEY"

# OpenAI (optional, for AI categorization)
# Получите ключ на https://platform.openai.com/
OPENAI_API_KEY="ВАШ_OPENAI_API_KEY"
```

### 3. Генерация NEXTAUTH_SECRET

Выполните в терминале:
```bash
openssl rand -base64 32
```

Скопируйте результат в `NEXTAUTH_SECRET` в `.env.local`

### 4. Настройка базы данных

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Получение API ключей

### Yandex Vision API

1. Зарегистрируйтесь на https://cloud.yandex.ru/
2. Создайте облако и каталог
3. Перейдите в "Сервисные аккаунты"
4. Создайте сервисный аккаунт
5. Выдайте ему роль "ai.vision.user" или "editor"
6. Создайте API ключ для сервисного аккаунта
7. Скопируйте ключ в `YANDEX_VISION_API_KEY`

### OpenAI API (опционально)

1. Зарегистрируйтесь на https://platform.openai.com/
2. Перейдите в раздел API Keys
3. Создайте новый ключ
4. Скопируйте ключ в `OPENAI_API_KEY`


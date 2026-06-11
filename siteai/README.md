# ⚡ SiteAI — AI-конструктор сайтов

Создавай сайты по описанию с помощью Claude AI.

---

## 🚀 Деплой на Vercel (5 минут)

### Шаг 1 — Загрузи на GitHub

1. Зайди на [github.com](https://github.com) → **New repository**
2. Назови репозиторий `siteai`
3. Загрузи все файлы этой папки

### Шаг 2 — Подключи к Vercel

1. Зайди на [vercel.com](https://vercel.com) → **Add New Project**
2. Выбери свой репозиторий `siteai`
3. Нажми **Deploy** — Vercel сам всё настроит

### Шаг 3 — Добавь API ключ

1. В Vercel → твой проект → **Settings → Environment Variables**
2. Добавь переменную:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** твой ключ с [console.anthropic.com](https://console.anthropic.com)
3. Нажми **Redeploy**

Готово! Твой сайт живёт по адресу `your-project.vercel.app` 🎉

---

## 💻 Локальный запуск

```bash
# Установи зависимости
npm install

# Скопируй .env файл
cp .env.example .env
# Открой .env и вставь свой API ключ

# Запусти
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173)

---

## 🔑 Получить API ключ Anthropic

1. Зайди на [console.anthropic.com](https://console.anthropic.com)
2. Зарегистрируйся
3. **API Keys → Create Key**
4. Скопируй ключ (начинается с `sk-ant-...`)

---

## 📁 Структура проекта

```
siteai/
├── index.html          # Точка входа
├── package.json        # Зависимости
├── vite.config.js      # Настройки Vite
├── .env.example        # Пример переменных окружения
└── src/
    ├── main.jsx        # React точка входа
    └── App.jsx         # Основное приложение
```

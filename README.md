# 🥗 Family Health Tracker

A full-stack health & calorie deficit tracker for the whole family. Track meals, gym activities, water intake, recipes, and weight — all synced to the cloud.

**🔗 Live at:** [https://calorie-counter-v2-nz7w.vercel.app](https://calorie-counter-v2-nz7w.vercel.app)

## Features

- 📊 **Calorie Tracking** — Log breakfast, lunch, snacks & dinner with a searchable food database
- 🏋️ **Gym Activity Tracker** — Track workouts with calorie burn calculations
- 💧 **Water Intake** — Daily water glass counter
- 📈 **Analytics** — Weekly/monthly charts for calories, weight trends & more
- 🍳 **Recipes** — Save & reuse custom meal recipes
- 👨‍👩‍👧‍👦 **Multi-Profile** — Track multiple family members
- 🌙 **Dark/Light Mode** — Beautiful themed UI
- 📱 **PWA** — Installable on mobile, works offline
- ☁️ **Cloud Sync** — Sign up to sync data across devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Shadcn UI |
| State | Zustand (localStorage persistence) |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon.tech) |
| ORM | Prisma 7 |
| Auth | JWT + bcrypt |
| Hosting | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Neon database URL and JWT secret

# Push database schema
npx prisma db push

# Run dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (pooler) |
| `JWT_SECRET` | Secret key for JWT token signing |

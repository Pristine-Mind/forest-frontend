# CFUG Forest Management System — Next.js

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_BASE_URL to your Django backend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack
- Next.js 15 (App Router)
- React Query v5 (data fetching)
- Zustand (auth state)
- Tailwind CSS v4 + shadcn/ui
- Zod + React Hook Form (validation)
- Token-based auth for Django REST Framework

## Backend
Set `NEXT_PUBLIC_API_BASE_URL` to your running Django backend.  
Auth uses `Authorization: Token <key>` header (DRF token auth).

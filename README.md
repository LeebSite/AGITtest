# AGIT Technical Assessment — Slot Balancing System

- **Candidate Token**: `GHALIBCANDIDATE`

## Stack Teknologi
- Backend: Node.js (ES Modules), Express.js, PostgreSQL, Prisma ORM
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4
- Pengujian: Vitest, Supertest

## Cara Menjalankan Proyek

### 1. Persiapan Database
Pastikan PostgreSQL berjalan dan sesuaikan file `.env` (contoh pada `.env.example`):
```bash
# Generate Prisma Client & Jalankan Migrasi
npx prisma generate
npx prisma migrate dev
```

### 2. Jalankan Backend API
```bash
npm run dev
```
Backend akan berjalan pada: `http://localhost:3000` (Health check: `http://localhost:3000/api/health`).

### 3. Jalankan Frontend Web
```bash
npm run frontend:dev
```
Aplikasi web akan berjalan pada: `http://localhost:5173`.

---

## Pengujian (Automated Tests)

```bash
# Jalankan Unit Test (Case 1 Balancer Logic)
npm test

# Jalankan Integration Test (API -> Service -> PostgreSQL)
npm run test:integration

# Jalankan Seluruh Test
npm run test:all
```

## Referensi Case 3 — Database & SQL

[`database/assessment.sql`](database/assessment.sql)

Untuk mengeksekusi langsung di PostgreSQL:
```bash
psql -U postgres -d agittest_db -f database/assessment.sql
```
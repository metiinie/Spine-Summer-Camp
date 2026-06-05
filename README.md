# Spine Summer Camp Registration System

This project contains the full bilingual (English/Amharic) registration system for the Spine Summer Camp 2026.

It is split into two parts:
1. **Frontend**: Next.js 14 App Router application.
2. **Backend**: NestJS REST API with Prisma ORM.

## Setup Instructions

### Backend (NestJS + Neon PostgreSQL)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_fZqL7YdAw4uB@ep-steep-pond-aq8dqeqk-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   JWT_SECRET="super-secret-jwt-key"
   RESEND_API_KEY="your-resend-key"
   ```
4. Push the Prisma schema and seed the database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *The backend will run on `http://localhost:4000`.*

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

**Admin Credentials (from seed):**
- Email: `admin@spinecamp.com`
- Password: `Admin@2026`

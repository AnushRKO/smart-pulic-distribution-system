# Smart Public Distribution System (Smart PDS)

> **Digital, Transparent and Accountable Distribution Management**

A complete full-stack web application for managing public distribution of essential commodities with role-based access control, real-time inventory tracking, and transparent transaction records.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@smartpds.local | Admin@1234 |
| Govt. Official | official@smartpds.local | Official@1234 |
| Distributor | distributor@smartpds.local | Dist@1234 |
| Beneficiary | beneficiary@smartpds.local | Ben@1234 |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcryptjs |
| Icons | Lucide React |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- npm or yarn

---

## Setup Instructions

### 1. Clone / Extract the project

```bash
cd "smart-pds"
```

### 2. Create PostgreSQL database

```sql
CREATE DATABASE smartpds;
```

### 3. Configure environment

```bash
cp .env.example backend/.env
```

Edit `backend/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smartpds"
JWT_SECRET="any-long-random-string"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Generate Prisma client & run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> If using the schema from the `prisma/` folder at root level, copy it:
```bash
copy ..\prisma\schema.prisma .\prisma\schema.prisma
```

### 6. Seed the database

```bash
npm run prisma:seed
```

### 7. Start the backend server

```bash
npm run dev
```
Backend will run at: http://localhost:3001

### 8. Install and start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```
Frontend will run at: http://localhost:5173

---

## Project Structure

```
smart-pds/
├── frontend/
│   ├── src/
│   │   ├── components/ui/     # Reusable UI components
│   │   ├── hooks/             # Zustand auth store
│   │   ├── layouts/           # AppLayout with role-aware sidebar
│   │   ├── pages/             # All page components by role
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── beneficiary/   # Beneficiary pages
│   │   │   ├── distributor/   # Distributor pages
│   │   │   ├── official/      # Govt. Official pages
│   │   │   └── admin/         # Administrator pages
│   │   ├── routes/            # ProtectedRoute component
│   │   ├── services/          # Axios API service calls
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # API client, helpers
│   │   └── App.tsx
│
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validate, error handlers
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Audit & notification services
│   │   ├── utils/             # Prisma client, JWT, ID generator
│   │   └── server.ts          # Express app entry point
│
├── prisma/
│   ├── schema.prisma          # Database schema (15 models)
│   └── seed.ts                # Demo data seeder
│
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| POST | /api/auth/register | Public |
| GET | /api/auth/me | Authenticated |
| GET | /api/beneficiaries | Admin, Official, Distributor |
| POST | /api/beneficiaries | Admin |
| GET | /api/inventory | Authenticated |
| POST | /api/inventory | Admin, Distributor |
| POST | /api/distributions | Admin, Distributor |
| GET | /api/transactions | Authenticated |
| GET | /api/notifications | Authenticated |
| GET | /api/reports/analytics | Admin, Official |
| GET | /api/reports/audit-logs | Admin, Official |

---

## Key Features

- ✅ JWT authentication with role-based access control
- ✅ 4 user roles: Beneficiary, Distributor, Govt. Official, Administrator
- ✅ Atomic distribution transactions (prevents negative inventory)
- ✅ Real-time inventory tracking with stock alerts
- ✅ In-app notification system
- ✅ Recharts analytics dashboards
- ✅ Complete audit logging
- ✅ Server-side pagination and search
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Input validation on frontend and backend
- ✅ Mock email/SMS provider (replace with real in production)

---

## Future Improvements

- OTP/Aadhaar-based biometric verification
- Real SMS integration (Twilio/MSG91)
- Real email (SendGrid/SES)
- PDF report export
- Offline PWA support
- Multi-state/district hierarchy
- Barcode/QR code scanning for ration cards

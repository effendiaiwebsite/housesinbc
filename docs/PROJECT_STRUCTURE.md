# Project Structure

## Overview
HousesinBCV2 is a full-stack TypeScript application using React + Vite on the frontend and Express.js on the backend with Firestore database.

---

## Directory Structure

```
HousesinBCV2/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Shadcn/ui components (Button, Dialog, etc.)
│   │   │   ├── LeadCaptureModal.tsx    # Universal lead capture modal
│   │   │   ├── Navigation.tsx          # Header navigation
│   │   │   ├── Footer.tsx              # Footer component
│   │   │   └── ...           # Other shared components
│   │   ├── pages/            # Page components (routes)
│   │   │   ├── Home.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Mortgage.tsx
│   │   │   ├── Incentives.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── Properties.tsx
│   │   │   ├── Dashboard.tsx           # Admin dashboard
│   │   │   ├── ClientDashboard.tsx     # Client portal
│   │   │   ├── AdminLogin.tsx          # Admin OTP login
│   │   │   └── ClientLogin.tsx         # Client OTP login
│   │   ├── lib/              # Utilities and helpers
│   │   │   ├── utils.ts      # General utilities
│   │   │   └── api.ts        # API client functions
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.ts    # Authentication hook
│   │   │   ├── useLeadCapture.ts  # Lead capture logic
│   │   │   └── ...
│   │   ├── assets/           # Static assets (images, PDFs, etc.)
│   │   ├── App.tsx           # Root component with router
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles (Tailwind)
│   ├── index.html            # HTML template
│   └── public/               # Public static files
│
├── server/                   # Backend Express application
│   ├── index.ts             # Server entry point & Express setup
│   ├── db.ts                # Firestore configuration & collection refs
│   ├── sms.ts               # Twilio SMS service (OTP sending)
│   ├── routes.ts            # API route handlers
│   ├── middleware.ts        # Auth & validation middleware
│   └── neighborhoods-data.ts # Static neighborhood data
│
├── shared/                  # Shared code between frontend & backend
│   └── schema.ts           # Zod schemas & TypeScript types
│
├── docs/                   # Documentation (for context management)
│   ├── PROJECT_STRUCTURE.md       # This file
│   ├── FIRESTORE_SCHEMA.md        # Database schema documentation
│   ├── API_ENDPOINTS.md           # API routes reference
│   ├── COMPONENT_MAP.md           # Component hierarchy & props
│   ├── ENV_VARIABLES.md           # Environment variable reference
│   └── PROGRESS.md                # Build progress tracker
│
├── dist/                   # Build output (generated)
│   ├── public/             # Frontend build
│   └── index.js            # Backend build
│
├── package.json            # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript config for Vite
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── .env.example           # Example environment variables
└── .env                   # Actual environment variables (git-ignored)
```

---

## Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.6.3** - Type safety
- **Vite 5.4.14** - Build tool & dev server
- **Wouter 3.3.5** - Lightweight routing
- **TanStack React Query 5.60.5** - Server state management
- **React Hook Form 7.55.0** - Form state management
- **Zod 3.24.2** - Schema validation
- **Tailwind CSS 3.4.17** - Styling
- **Shadcn/ui** - Component library (Radix UI primitives)
- **Leaflet 1.9.4** - Maps for neighborhood explorer
- **Recharts 2.15.2** - Analytics charts
- **React Big Calendar 1.15.0** - Calendar view for appointments
- **Lucide React 0.453.0** - Icons
- **Framer Motion 11.13.1** - Animations

### Backend
- **Express 4.21.2** - HTTP server framework
- **TypeScript 5.6.3** - Type safety
- **Firebase Admin 12.0.0** - Firestore database SDK
- **Twilio 5.3.5** - SMS OTP service
- **Express Session 1.18.1** - Session management
- **Zod 3.24.2** - Request validation

### Development
- **TSX 4.19.1** - TypeScript execution
- **ESBuild 0.25.0** - Backend bundling
- **Autoprefixer** - CSS vendor prefixes

---

## Build & Development Scripts

```bash
# Install dependencies
npm install

# Development (starts both frontend and backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# TypeScript type checking
npm run check
```

---

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in:
   - Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
   - Firebase credentials (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
   - Admin phone number (+14034783995)
   - Zillow RapidAPI key (RAPIDAPI_KEY)
   - Session secret (SESSION_SECRET)

---

## Key Architectural Decisions

### 1. **OTP Authentication**
- Both admin and client use phone-based OTP login
- No password storage required
- Admin identified by specific phone number: +14034783995
- Session-based authentication after OTP verification

### 2. **Universal Lead Capture**
- Single `LeadCaptureModal` component used across all pages
- Triggered by interactions: calculator usage, property views, downloads
- Title: "Verify you're a real person" (subtle approach)
- Captures: Name + Phone Number + Source + Metadata

### 3. **Firestore Over PostgreSQL**
- No ORM needed (direct Firestore SDK)
- Real-time capabilities built-in
- Scalable serverless database
- Document-based schema (more flexible than relational)

### 4. **No Replit Dependencies**
- Clean Vite config (no Replit plugins)
- Can be deployed anywhere (Vercel, AWS, GCP, etc.)

### 5. **Shared Schema Validation**
- Single source of truth for data structures
- Validated on both client (UX) and server (security)
- TypeScript types auto-generated from Zod schemas

---

## Data Flow

```
User Action (Frontend)
  ↓
React Component
  ↓
React Hook Form + Zod Validation
  ↓
API Request (fetch)
  ↓
Express Route Handler
  ↓
Middleware (auth, validation)
  ↓
Firestore Query/Write
  ↓
Response to Client
  ↓
React Query Cache Update
  ↓
UI Re-render
```

---

## Routing Structure

### Public Routes
- `/` - Home page
- `/landing` - Lead capture landing page
- `/pricing` - Neighborhood explorer
- `/mortgage` - Mortgage calculator
- `/incentives` - Government incentives info
- `/blog` - Blog listing
- `/blog/:id` - Individual blog post
- `/properties` - Property search

### Admin Routes (require OTP auth)
- `/admin/login` - Admin OTP login
- `/admin/dashboard` - Analytics & management dashboard
- `/admin/leads` - Lead management
- `/admin/appointments` - Appointment calendar view
- `/admin/blogs` - Blog CMS
- `/admin/newsletters` - Newsletter subscribers

### Client Routes (require OTP auth)
- `/client/login` - Client OTP login
- `/client/dashboard` - Client appointments & profile

---

## API Structure

All API routes prefixed with `/api/`

See `API_ENDPOINTS.md` for complete documentation.

---

**Last Updated:** Phase 1 - Initial Setup

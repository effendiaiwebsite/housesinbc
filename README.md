# HousesinBCV2 - First-Time Home Buyer Platform

A complete lead generation website for real estate professionals in British Columbia, built with React, TypeScript, Express, and Firestore.

---

## 🎯 Project Status: 80% Complete (Phase 4)

### ✅ Completed Features:
- **Authentication System** - OTP-based login for admin and clients via Twilio SMS
- **Lead Capture System** - Universal modal integrated across all pages with 7 capture sources
- **7 Public Pages** - Home, Landing, Mortgage Calculator, Incentives, Neighborhoods, Properties, Blog
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Firestore Database** - Complete schema with 9 collections
- **API Layer** - RESTful endpoints for auth and lead management

### ⏳ Remaining Work (20%):
- **Admin Dashboard** - Analytics, lead management, appointment calendar (Phase 5)
- **Client Portal** - Appointment booking interface (Phase 6)
- **Final Polish** - Testing, asset copying, optimization (Phase 7)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required credentials:
- **Twilio** - Account SID, Auth Token, Phone Number
- **Firebase** - Project ID, Private Key, Client Email
- **Admin Phone** - +14034783995

See [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) for detailed setup instructions.

### 3. Run Development Server
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API: http://localhost:3000/api

---

## 📚 Documentation

Complete documentation is available in the `/docs` folder:

| Document | Purpose |
|----------|---------|
| **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** | Complete setup and installation instructions |
| **[PROGRESS.md](docs/PROGRESS.md)** | Build progress tracker and phase breakdown |
| **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** | Architecture and directory organization |
| **[FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md)** | Database collections and schema |
| **[API_ENDPOINTS.md](docs/API_ENDPOINTS.md)** | API routes and request/response formats |
| **[COMPONENT_MAP.md](docs/COMPONENT_MAP.md)** | Component hierarchy and usage guide |
| **[ENV_VARIABLES.md](docs/ENV_VARIABLES.md)** | Environment variable reference |

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** + **TypeScript 5.6**
- **Vite 5.4** - Fast build tool
- **Tailwind CSS 3.4** - Styling
- **Wouter 3.3** - Lightweight routing
- **TanStack Query 5.6** - Server state management
- **React Hook Form 7.55** - Form management
- **Zod 3.24** - Schema validation
- **Radix UI** - Accessible component primitives

### Backend
- **Express 4.21** + **TypeScript**
- **Firebase Admin 12.0** - Firestore database
- **Twilio 5.3** - SMS OTP authentication
- **Express Session 1.18** - Session management

---

## 📁 Project Structure

```
HousesinBCV2/
├── client/src/          # React frontend
│   ├── components/      # UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities & API client
├── server/             # Express backend
│   ├── routes/         # API endpoints
│   ├── db.ts          # Firestore config
│   └── sms.ts         # Twilio SMS service
├── shared/             # Shared types & schemas
├── docs/               # Documentation
└── .env               # Environment variables
```

---

## 🔑 Key Features

### Authentication
- **OTP-Based Login** - SMS verification via Twilio
- **Admin Access** - Specific phone number: +14034783995
- **Client Access** - Any valid phone number
- **Session Management** - 24-hour sessions with secure cookies

### Lead Capture
- **7 Capture Sources** - Landing, Mortgage, Incentives, Pricing, Blog, Properties, Calculator
- **Smart Modal** - "Verify you're a real person" approach
- **Session Tracking** - Prevents duplicate captures for 24 hours
- **Metadata Support** - Tracks context (calculator values, viewed properties, etc.)

### Public Pages
1. **Home** - Hero section with features and realtor profile
2. **Landing** - Free guide download lead magnet
3. **Mortgage Calculator** - Interactive payment calculator
4. **Incentives** - 4 government programs detailed
5. **Neighborhoods** - 6 BC areas with pricing and amenities
6. **Properties** - Property search and listings
7. **Blog** - Content marketing platform

---

## 🧪 Testing

### Test Admin Login:
1. Visit http://localhost:5173/admin/login
2. Enter: `+14034783995`
3. Check terminal for OTP code (logged in development)
4. Verify and access admin dashboard

### Test Client Login:
1. Visit http://localhost:5173/client/login
2. Enter any E.164 phone number
3. Follow same OTP process
4. Access client dashboard

### Test Lead Capture:
1. Visit any public page
2. Interact (e.g., click "Calculate" on mortgage page)
3. Modal should appear
4. Submit form and check Firestore console

---

## 🔒 Security Features

- **OTP Authentication** - No password storage required
- **Session-based Auth** - HTTP-only secure cookies
- **Input Validation** - Zod schemas on client and server
- **Role-based Access** - Admin vs. client permissions
- **Firebase Security** - Firestore rules (to be configured)

---

## 🎨 Design System

- **Colors:** Blue (primary), Green (success), Orange (warning)
- **Typography:** Modern sans-serif with Font Awesome icons
- **Components:** Shadcn/ui with Radix UI primitives
- **Responsive:** Mobile-first design with Tailwind breakpoints

---

## 📊 Database Schema

### Collections:
- **leads** - Lead captures with source tracking
- **users** - Admin and client accounts
- **otp_codes** - One-time password codes (10-min expiry)
- **appointments** - Property viewing bookings
- **webinar_signups** - Educational event registrations
- **newsletters** - Email subscriptions
- **blogs** - Content management
- **properties** - Property listings
- **neighborhoods** - BC area data

See [FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md) for complete details.

---

## 🚧 Remaining Development

### Phase 5: Admin Dashboard (Next)
- Analytics overview with charts
- Lead management table with filtering
- Appointment calendar view
- Export functionality

### Phase 6: Client Portal
- Client dashboard
- Property viewing appointments
- Appointment management

### Phase 7: Final Polish
- Copy assets from V1
- Mobile testing
- Performance optimization
- Production deployment setup

---

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server (frontend + backend)

# Build
npm run build        # Build for production

# Type Checking
npm run check        # Run TypeScript compiler

# Production
npm start            # Start production server
```

---

## 🐛 Troubleshooting

### "Failed to send OTP"
- Check Twilio credentials in `.env`
- In development, OTP is logged to console

### "Firebase connection error"
- Verify Firebase credentials
- Ensure Firestore is enabled in Firebase Console
- Check `FIREBASE_PRIVATE_KEY` has proper `\n` newlines

### "Port 3000 already in use"
- Change `PORT` in `.env`

See [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for more troubleshooting.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👤 Contact

For questions or support:
- Check documentation in `/docs` folder
- Review existing code and comments
- Refer to PROGRESS.md for current status

---

## 🙏 Acknowledgments

Built with:
- React & TypeScript
- Firebase/Firestore
- Twilio SMS API
- Shadcn/ui Components
- Tailwind CSS

---

**Version:** 2.0 (HousesinBCV2)
**Status:** Phase 4 Complete (80%)
**Last Updated:** January 2025

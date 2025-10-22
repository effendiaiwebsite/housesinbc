# HousesinBCV2 - Next Session Tasks

## Project Status
- ✅ Authentication (OTP via Twilio) - Working
- ✅ Admin Dashboard - Working
- ✅ Client Dashboard - Working
- ✅ Properties Page with Zillow API - Working
- ✅ Neighborhoods Page - Working
- ✅ Property Details Modal - Working
- ✅ Lead Capture System - Working (but needs fixes)

## Current Environment
- **Backend**: Node.js/Express/TypeScript on port 3000
- **Frontend**: React/Vite/TypeScript on port 5173
- **Database**: Firestore
- **SMS**: Twilio
- **API**: Zillow (zillow-com1 via RapidAPI)
- **Admin Phone**: +14034783995

## Critical Issues to Fix (Priority Order)

### 🔴 CRITICAL - Issue #6 & #7: Fix Appointments Flow
**Problem**:
- When user clicks "Schedule Viewing" on a property, it creates a LEAD instead of an APPOINTMENT
- Appointments show zero in admin dashboard even though bookings were made
- Users are not being auto-registered when they book appointments

**Current Flow (WRONG)**:
1. User clicks "Schedule Viewing" → Opens LeadCaptureModal
2. User fills name/phone/email → Creates a LEAD in Firestore
3. Lead appears in admin dashboard under "Recent Leads"
4. Appointments count stays at 0

**Expected Flow (CORRECT)**:
1. User clicks "Schedule Viewing" → Opens appointment booking modal (with property details)
2. User fills name/phone/email + preferred date/time → Creates APPOINTMENT in Firestore
3. System auto-registers user with phone number (creates user in Firestore if not exists)
4. Appointment appears in admin dashboard "Appointments" section
5. User can log in with their phone number to see booked appointments in Client Portal

**Files to Modify**:
- `client/src/components/LeadCaptureModal.tsx` - Need to differentiate between leads and appointments
- `client/src/pages/Properties.tsx` - Change `handleScheduleViewing` to create appointments
- `server/routes/appointments.ts` - May need to update appointment creation logic
- `server/routes/auth.ts` - Auto-register users when appointment is created

**Solution Approach**:
1. Create separate `AppointmentBookingModal.tsx` component (or modify LeadCaptureModal to handle both)
2. Include property details, date/time picker in the modal
3. On submit: Create appointment + Auto-register user + Send confirmation
4. Update admin dashboard to show appointments correctly

---

### 🟡 HIGH PRIORITY

### Issue #1: Rida's Picture Not Showing on Main Page
**Location**: `client/src/pages/Home.tsx` or `client/src/pages/Landing.tsx`
**Problem**: Image source is broken or path is incorrect
**Action**: Find the image reference and fix the path to point to correct asset

---

### Issue #2: Download Free Guide Button
**Problem**: Button doesn't do anything
**Expected Flow**:
1. User clicks "Download Free Guide"
2. LeadCaptureModal opens (source: 'guide')
3. User fills in details
4. Lead is captured
5. Guide PDF downloads automatically: `client/src/assets/HomeBuyingGuide.pdf`

**Files to Modify**:
- Find the "Download Free Guide" button (likely in `Landing.tsx` or `Home.tsx`)
- Wire up `trigger('guide')` from `useLeadCapture` hook
- On successful lead capture, trigger download of `HomeBuyingGuide.pdf`
- Update `LeadCaptureModal` to auto-download PDF after submission if source is 'guide'

---

### Issue #3: Enhance Download Page
**Location**: Likely `client/src/pages/Landing.tsx` or a dedicated download page
**Improvements Needed**:
- Add more compelling copy about the guide
- Add testimonials or social proof
- Add preview of what's inside the guide
- Make it visually more appealing with better layout

---

### Issue #4: Incentives Page Buttons Don't Work
**Location**: `client/src/pages/Incentives.tsx`
**Problem**: Buttons likely don't have onClick handlers or lead capture integration
**Action**:
- Find all buttons on Incentives page
- Wire up lead capture with `trigger('incentives')`
- Or link to appropriate pages

---

### 🟢 MEDIUM PRIORITY

### Issue #5: Admin Dashboard - Add More Pages
**Current**: Single dashboard page showing overview
**Needed**: Separate pages for:
1. **Leads Page** - Full list of all leads with filters by source
2. **Appointments Page** - Full list of appointments with status management
3. **Analytics Page** - Detailed charts and trends
4. **Subscribers Page** - Newsletter subscribers

**Files to Create**:
- `client/src/pages/AdminLeads.tsx`
- `client/src/pages/AdminAppointments.tsx`
- `client/src/pages/AdminAnalytics.tsx`
- `client/src/pages/AdminSubscribers.tsx`
- Update `client/src/App.tsx` with new routes
- Update admin navigation/sidebar

---

### Issue #8: Lead Activity Tracking
**Problem**: Need to track which lead sources each user has engaged with
**Expected**:
- Each lead/user can engage with multiple sources (landing, properties, guide, etc.)
- Admin can see a lead's "activity timeline" - all 7 lead capture sources they've used
- Click on a lead → See activity: "Downloaded guide on 2025-01-20, Scheduled viewing on 2025-01-21, etc."

**Database Schema Change Needed**:

Current:
```javascript
leads: {
  id: string,
  name: string,
  phoneNumber: string,
  email: string,
  source: string, // Single source
  metadata: object,
  createdAt: timestamp
}
```

Proposed:
```javascript
users: {
  id: string,
  phoneNumber: string, // Primary identifier
  name: string,
  email: string,
  role: 'client' | 'admin',
  createdAt: timestamp,
  lastActivity: timestamp
}

lead_activities: {
  id: string,
  userId: string, // Reference to users collection
  source: 'landing' | 'mortgage' | 'incentives' | 'pricing' | 'blog' | 'properties' | 'guide',
  metadata: object, // Source-specific data
  createdAt: timestamp
}
```

**Implementation**:
1. Create new `lead_activities` collection in Firestore
2. When lead is captured, create/update user + create activity record
3. Merge duplicate users by phone number
4. Update admin dashboard to show activity timeline per user
5. Create "Lead Details" page showing all activities for a user

---

## Project Structure Reference

### Key Files
```
server/
├── routes/
│   ├── auth.ts (OTP authentication)
│   ├── leads.ts (Lead capture)
│   ├── appointments.ts (Appointment booking)
│   ├── analytics.ts (Admin stats)
│   ├── properties.ts (Zillow API)
│   └── neighborhoods.ts (Zillow API)
├── services/
│   └── zillow.ts (Zillow API integration)
├── db.ts (Firestore setup)
└── index.ts (Express server)

client/src/
├── pages/
│   ├── Home.tsx
│   ├── Landing.tsx
│   ├── Properties.tsx
│   ├── Neighborhoods.tsx
│   ├── Incentives.tsx
│   ├── Mortgage.tsx
│   ├── Pricing.tsx
│   ├── Dashboard.tsx (Admin)
│   └── ClientDashboard.tsx
├── components/
│   ├── LeadCaptureModal.tsx
│   ├── PropertyDetailsModal.tsx
│   └── Navigation.tsx
├── hooks/
│   ├── useLeadCapture.ts
│   └── useAuth.tsx
└── lib/
    └── api.ts
```

### API Endpoints
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
GET  /api/auth/status
POST /api/auth/logout

POST /api/leads
GET  /api/leads
DELETE /api/leads/:id

POST /api/appointments
GET  /api/appointments
PUT  /api/appointments/:id
DELETE /api/appointments/:id

GET  /api/analytics/stats
GET  /api/analytics/leads-trend

GET  /api/properties/search
GET  /api/properties/:zpid

GET  /api/neighborhoods
GET  /api/neighborhoods/:location
```

### Firestore Collections
```
users: User accounts (admin + clients)
otp_codes: Temporary OTP codes
leads: Lead captures (NEEDS REFACTOR → lead_activities)
appointments: Property viewing appointments
webinar_signups: Webinar registrations
newsletters: Email subscribers
blogs: Blog posts
properties: Saved properties
neighborhoods: Saved neighborhood data
```

---

## Important Notes

1. **Zillow API**: Using `zillow-com1.p.rapidapi.com` - User has active subscription
2. **RapidAPI Key**: Stored in `.env` as `RAPIDAPI_KEY`
3. **Firebase**: Working, credentials in `.env`
4. **Twilio**: Working, sending SMS successfully
5. **OTP Authentication**: Working perfectly
6. **Both servers must be running**: `npm run dev` (backend) + `npx vite` (frontend)

---

## Quick Start Commands
```bash
# Start backend
npm run dev

# Start frontend (in new terminal)
npx vite

# Both servers should be running:
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

---

## Session Goals for Next Time

**Priority 1**: Fix appointments flow (#6, #7) - Make "Schedule Viewing" create appointments, not leads
**Priority 2**: Fix guide download (#2) - Lead capture → auto-download PDF
**Priority 3**: Fix Rida's picture (#1)
**Priority 4**: Fix incentives buttons (#4)
**Priority 5**: Enhance download page (#3)
**Priority 6**: Add admin sub-pages (#5)
**Priority 7**: Implement activity tracking (#8)

---

## Context for AI Assistant

This is a real estate lead generation website with OTP authentication, Zillow integration, and admin/client portals. The main issue is that the appointment booking flow is broken - it's creating leads instead of appointments. Users should be auto-registered when they book viewings and see their appointments in the client portal. The system should track all lead activities across 7 different sources.

The codebase is TypeScript/React/Express with Firestore database. Both servers are running and authentication works perfectly. The Zillow API integration is functional and showing live property data.

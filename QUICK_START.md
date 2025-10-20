# Quick Start Guide

Get the application running in 5 minutes!

---

## Prerequisites

- Node.js installed ✓ (already have this)
- npm installed ✓ (already have this)
- Firebase project created
- Twilio account created

---

## Step 1: Dependencies (Already Done ✓)

```bash
cd /home/vboxuser/programs/Rida/HousesinBCV2
npm install  # Already completed - 563 packages installed
```

---

## Step 2: Environment Setup

### Create `.env` file:

```bash
cp .env.example .env
```

### Edit `.env` with your credentials:

**Minimum required to test (without SMS):**
```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=any-random-32-character-string-here-for-testing
ADMIN_PHONE_NUMBER=+14034783995

# Leave these for now (will work in dev mode without real credentials)
TWILIO_ACCOUNT_SID=ACtest
TWILIO_AUTH_TOKEN=test
TWILIO_PHONE_NUMBER=+10000000000

FIREBASE_PROJECT_ID=test
FIREBASE_PRIVATE_KEY="test"
FIREBASE_CLIENT_EMAIL=test@test.com
```

**Note:** With these test values:
- OTP codes will be logged to console (not sent via SMS)
- You can test the UI without real services
- You'll need real credentials for production

---

## Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
🔗 API: http://localhost:3000/api
🎨 Frontend dev server: http://localhost:5173 (Vite)
💡 Admin phone number: +14034783995
```

---

## Step 4: Access the Application

Open your browser:

### Main Site:
**http://localhost:5173**

You should see the Home page with:
- Hero section
- Navigation menu
- Features grid
- Footer

### Try These Pages:
- **Landing:** http://localhost:5173/landing
- **Mortgage:** http://localhost:5173/mortgage
- **Incentives:** http://localhost:5173/incentives
- **Pricing:** http://localhost:5173/pricing
- **Properties:** http://localhost:5173/properties
- **Blog:** http://localhost:5173/blog

---

## Step 5: Test Authentication

### Admin Login:
1. Go to: http://localhost:5173/admin/login
2. Enter phone: `+14034783995`
3. Click "Send Code"
4. **Check your terminal** - you'll see:
   ```
   🔐 OTP Code for +14034783995: 123456
   ```
5. Enter the 6-digit code
6. You should be redirected to admin dashboard placeholder

### Client Login:
1. Go to: http://localhost:5173/client/login
2. Enter any phone: `+12345678900`
3. Same process - OTP will be in terminal
4. Redirected to client dashboard placeholder

---

## Step 6: Test Lead Capture

1. Go to: http://localhost:5173/mortgage
2. Adjust the sliders (home price, down payment, etc.)
3. Click "Calculate Payment"
4. **Lead Capture Modal appears!**
5. Enter:
   - Name: "Test User"
   - Phone: "+12345678900"
6. Click "Continue"
7. Check terminal - you'll see the API request logged

**Note:** Modal won't appear again for 24 hours (session tracking)

---

## What Works Now

### ✅ Fully Functional:
- All 7 public pages
- Navigation and routing
- Responsive design
- Mortgage calculator
- Lead capture system (UI only without Firebase)
- Authentication flow (OTP logged to console)

### ⚠️ Requires Setup:
- **Twilio (for real SMS):** Get credentials from https://www.twilio.com
- **Firebase (for database):** Get credentials from https://console.firebase.google.com

### ⏳ Coming in Phase 5-7:
- Admin dashboard with analytics
- Client portal with bookings
- Real data persistence

---

## Common Issues

### Issue: "Port 3000 already in use"
```bash
# Change port in .env
PORT=3001
```

### Issue: "Cannot find module"
```bash
npm install
# Restart dev server
```

### Issue: "OTP not showing"
- Check terminal output (not browser console)
- Look for: `🔐 OTP Code for +...`

---

## Next Steps

### For Testing Only:
You're all set! Explore the pages and test the UI.

### For Real Deployment:
1. Get Twilio credentials
2. Get Firebase credentials
3. Update `.env` with real values
4. Restart server
5. Test OTP via SMS
6. Test data persistence in Firestore

### For Development:
1. Read `docs/NEXT_STEPS.md`
2. Start building Phase 5 (Admin Dashboard)

---

## Quick Commands

```bash
# Start server
npm run dev

# Stop server
Ctrl + C

# Check for errors
npm run check

# Build for production
npm run build
```

---

## URLs to Remember

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health
- **Admin Login:** http://localhost:5173/admin/login
- **Client Login:** http://localhost:5173/client/login

---

## File to Check for OTP

When testing auth, watch the terminal where you ran `npm run dev`.

You'll see logs like:
```
POST /api/auth/send-otp 200 - 45ms

🔐 OTP Code for +14034783995: 123456
```

---

## What to Do If Stuck

1. Check terminal for errors
2. Check browser console (F12)
3. Read `docs/SETUP_GUIDE.md` for detailed help
4. Verify `.env` file exists and has values
5. Make sure both servers are running

---

## Success Indicators

You know it's working when:
- ✅ Terminal shows "Server running on port 3000"
- ✅ Browser opens to http://localhost:5173
- ✅ You can navigate between pages
- ✅ Calculator works and shows results
- ✅ Lead modal appears after interactions
- ✅ OTP codes appear in terminal

---

## Congratulations! 🎉

You now have a fully functional lead generation website running locally!

**Next:** Get real credentials for Twilio and Firebase to enable SMS and data persistence.

---

**Total Setup Time:** ~5 minutes
**What's Working:** 80% of the application
**What's Left:** Admin dashboard, Client portal, and polish

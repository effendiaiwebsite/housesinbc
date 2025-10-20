# Setup Guide - HousesinBCV2

Complete guide to set up and run the application locally.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project created
- Twilio account created (for SMS OTP)

---

## Step 1: Install Dependencies

```bash
cd /home/vboxuser/programs/Rida/HousesinBCV2
npm install
```

This will install all dependencies listed in `package.json`.

---

## Step 2: Set Up Firebase (Firestore)

### Create Firebase Project:
1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable Firestore Database
4. Create a Service Account:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

### Extract Credentials:
From the downloaded JSON file, you'll need:
- `project_id`
- `private_key`
- `client_email`

---

## Step 3: Set Up Twilio (SMS)

### Create Twilio Account:
1. Go to https://www.twilio.com
2. Sign up for an account
3. Get a phone number with SMS capability
4. Find your credentials:
   - Account SID
   - Auth Token
   - Your Twilio Phone Number

---

## Step 4: Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Server
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-random-secret-key-here-change-this

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Admin Phone Number for OTP Login
ADMIN_PHONE_NUMBER=+14034783995

# Firebase/Firestore Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Zillow API (RapidAPI) - Optional for now
RAPIDAPI_KEY=your-rapidapi-key-here
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- For `FIREBASE_PRIVATE_KEY`, keep the quotes and the `\n` for newlines
- Generate a strong random string for `SESSION_SECRET` (at least 32 characters)
- The admin phone number is +14034783995 (as specified)

---

## Step 5: Run the Application

### Development Mode:
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173 (Vite)

### Access the Application:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

---

## Step 6: Test Authentication

### Test Admin Login:
1. Go to http://localhost:5173/admin/login
2. Enter phone: `+14034783995`
3. Click "Send Code"
4. Check terminal for OTP code (in development mode, it's logged to console)
5. Enter the 6-digit code
6. You should be redirected to admin dashboard placeholder

### Test Client Login:
1. Go to http://localhost:5173/client/login
2. Enter any valid phone number (E.164 format: +1234567890)
3. Follow same OTP process
4. You should be redirected to client dashboard placeholder

---

## Step 7: Test Public Pages

Visit these pages to test:
- **Home:** http://localhost:5173/
- **Landing:** http://localhost:5173/landing
- **Mortgage Calculator:** http://localhost:5173/mortgage
- **Incentives:** http://localhost:5173/incentives
- **Neighborhoods:** http://localhost:5173/pricing
- **Properties:** http://localhost:5173/properties
- **Blog:** http://localhost:5173/blog

---

## Step 8: Test Lead Capture

1. Go to any page (e.g., Mortgage Calculator)
2. Interact with the page (e.g., click "Calculate Payment")
3. Lead capture modal should appear
4. Fill in name and phone number
5. Submit form
6. Check terminal logs to verify lead was saved to Firestore

---

## Troubleshooting

### Issue: "Failed to send OTP"
- **Solution:** Check Twilio credentials in `.env`
- **Development Mode:** OTP codes are logged to console even if Twilio fails

### Issue: "Firebase connection error"
- **Solution:** Verify Firebase credentials in `.env`
- **Check:** Make sure private key has proper `\n` newlines
- **Check:** Firestore is enabled in Firebase console

### Issue: "Port 3000 already in use"
- **Solution:** Change `PORT` in `.env` to another port (e.g., 3001)

### Issue: "Module not found" errors
- **Solution:** Run `npm install` again
- **Check:** You're in the correct directory (HousesinBCV2)

### Issue: TypeScript errors
- **Solution:** Run `npm run check` to see detailed errors
- Most errors should be resolved already

---

## Development Tips

### View Logs:
- Backend logs appear in the terminal where you ran `npm run dev`
- OTP codes are logged in development mode
- API requests are logged with timing information

### Database Viewing:
- Go to Firebase Console > Firestore Database
- View collections: leads, users, otp_codes, etc.

### Testing Lead Sources:
Leads are tracked by source. Test each:
- `landing` - Landing page form
- `mortgage` - Mortgage calculator
- `incentives` - Incentives page
- `pricing` - Neighborhood explorer
- `properties` - Property search
- `blog` - Blog pages
- `calculator` - Any calculator usage

---

## Next Steps (After Testing)

### Phase 5: Admin Dashboard
Create admin dashboard with:
- Analytics overview
- Lead management table
- Appointment calendar
- Charts and statistics

### Phase 6: Client Portal
Build client portal with:
- Client dashboard
- Appointment booking
- Property viewing scheduler

### Phase 7: Polish
- Copy assets from HousesinBCV1
- Add missing integrations
- Mobile testing
- Performance optimization

---

## Production Deployment Checklist

Before deploying to production:

1. **Environment Variables:**
   - [ ] Set `NODE_ENV=production`
   - [ ] Change `SESSION_SECRET` to secure random string
   - [ ] Set `cookie.secure=true` in session config

2. **Security:**
   - [ ] Remove console.log statements
   - [ ] Enable HTTPS
   - [ ] Set up proper CORS policies
   - [ ] Add rate limiting to API endpoints

3. **Database:**
   - [ ] Set up Firestore security rules
   - [ ] Configure backups
   - [ ] Add indexes for common queries

4. **Testing:**
   - [ ] Test all authentication flows
   - [ ] Test lead capture from all sources
   - [ ] Test on mobile devices
   - [ ] Load testing

---

## Support

For issues or questions:
1. Check docs/PROGRESS.md for current status
2. Check docs/PROJECT_STRUCTURE.md for architecture
3. Check docs/FIRESTORE_SCHEMA.md for database structure
4. Check docs/API_ENDPOINTS.md for API reference

---

**Last Updated:** Phase 4 Complete

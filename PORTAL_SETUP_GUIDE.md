# Portal Setup Guide

## Why Admin/Client Portals Appear Empty

The admin and client portals **ARE working correctly**, but they appear empty because:

1. ✅ **Firestore is connected properly**
2. ✅ **APIs are functioning**
3. ❌ **There's no data in Firestore yet**

The portals can only display data that exists in your Firestore database. Since this is a fresh deployment, the database is empty.

---

## Understanding the Portal Data Flow

### Admin Portal Shows:
- **Leads** from the `leads` collection
- **Appointments** from the `appointments` collection
- **Analytics** calculated from leads + appointments
- **Newsletter subscribers** from the `newsletters` collection

### Client Portal Shows:
- **User's appointments** (filtered by phone number)
- **Saved properties** for that specific user

---

## How to Test the Portals

### Option 1: Generate Test Data (Quick Test)

You can add test data directly to Firestore using the Firebase Console:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `rida-ad632`
3. **Click "Firestore Database"** in the left sidebar
4. **Add test documents**:

#### Add a Test Lead:
- Collection: `leads`
- Document ID: Auto-generate
- Fields:
  ```
  name: "John Doe"
  phoneNumber: "+16041234567"
  email: "john@example.com"
  source: "landing"
  metadata: {}
  createdAt: (timestamp) Now
  ```

#### Add a Test Appointment:
- Collection: `appointments`
- Document ID: Auto-generate
- Fields:
  ```
  userId: "test123"
  clientName: "Jane Smith"
  clientPhone: "+17781234567"
  propertyAddress: "123 Main St, Vancouver, BC"
  preferredDate: (timestamp) Tomorrow
  preferredTime: "2:00 PM"
  status: "pending"
  notes: "First time buyer"
  createdAt: (timestamp) Now
  ```

### Option 2: Use the Live Website to Generate Real Data

The **best way** to populate data is by using the actual website features:

#### Generate Leads:
1. Visit: https://housesinbc.onrender.com/landing
2. Fill out the "Get Free Guide" form
3. Submit with your name, phone, and email
4. This creates a lead in Firestore!

#### Generate More Leads:
- Visit the **Mortgage Calculator** page and submit
- Visit the **Incentives** page and submit
- Each form submission creates a lead

#### Book an Appointment (as Client):
1. Login as a client: https://housesinbc.onrender.com/client/login
2. Enter your phone number
3. Verify with the OTP code (sent via Twilio SMS)
4. Once logged in, book a viewing appointment
5. This creates both:
   - An appointment in Firestore
   - A user session

---

## Verifying Data is Working

### Step 1: Generate Some Test Data
Use Option 2 above to generate real data through the website

### Step 2: Login as Admin
1. Go to: https://housesinbc.onrender.com/admin/login
2. Enter: `+14034783995` (the admin phone number)
3. You'll receive an OTP via SMS (Twilio)
4. Enter the code to login

### Step 3: View the Data
- **Admin Analytics**: See total leads, appointments, conversion rates
- **Admin Leads**: View all captured leads with details
- **Admin Appointments**: See all booked viewings

### Step 4: Test Client Portal
1. Go to: https://housesinbc.onrender.com/client/login
2. Login with a phone number you used to book an appointment
3. Verify with OTP
4. You'll see your appointments and saved properties

---

## Current Database State

Your Firestore database is properly configured with these collections:
- `leads` - Currently empty
- `appointments` - Currently empty
- `newsletters` - Currently empty
- `saved_properties` - Currently empty
- `users` - Created when users sign in
- `otp_codes` - Temporary OTP codes (auto-deleted)

**All collections will populate as users interact with the site.**

---

## Testing Authentication

### Admin Login Test:
```bash
# 1. Send OTP to admin phone
curl -X POST https://housesinbc.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+14034783995"}'

# 2. Check your SMS for the OTP code
# 3. Verify (replace XXXXXX with actual code):
curl -X POST https://housesinbc.onrender.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+14034783995","code":"XXXXXX","loginType":"admin"}' \
  -c cookies.txt

# 4. Check auth status (should show authenticated):
curl https://housesinbc.onrender.com/api/auth/status \
  -b cookies.txt
```

---

## Common Questions

### Q: Why is my admin portal showing zeros?
**A:** Because there's no data in Firestore yet. Generate some test data using the methods above.

### Q: Why can't I see any appointments in client portal?
**A:** You need to:
1. Be logged in with the same phone number you used to book appointments
2. Have actually booked appointments through the site or added them to Firestore

### Q: How do I know if Firestore is connected?
**A:** The site is working! Check the Render logs:
- Go to https://dashboard.render.com
- Click your service
- Click "Logs"
- You should see: `✅ Firebase Admin initialized`

### Q: Can I test without SMS?
**A:** Yes! In development mode, OTP codes are logged to the console. In production (Render), you need actual phone numbers and will receive real SMS via Twilio.

---

## Next Steps

1. **Generate test data** using the website forms
2. **Login as admin** to see the data in the admin portal
3. **Login as client** to test the client experience
4. **Monitor Firestore** via Firebase Console to see data being added

The portals are working perfectly - they just need data to display!

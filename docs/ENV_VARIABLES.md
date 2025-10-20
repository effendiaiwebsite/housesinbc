# Environment Variables Reference

Complete list of all environment variables required for the application.

---

## Required Variables

### Server Configuration

#### NODE_ENV
- **Description:** Application environment
- **Values:** `development` | `production`
- **Default:** `development`
- **Example:** `NODE_ENV=development`

#### PORT
- **Description:** Server port number
- **Default:** `3000`
- **Example:** `PORT=3000`

#### SESSION_SECRET
- **Description:** Secret key for session encryption
- **Security:** Must be a strong random string (32+ characters)
- **Example:** `SESSION_SECRET=your-super-secret-random-key-minimum-32-chars`
- **Generate:** Use `openssl rand -base64 32`

---

### Twilio SMS Configuration

#### TWILIO_ACCOUNT_SID
- **Description:** Twilio account SID
- **Format:** Starts with "AC" followed by 32 characters
- **Example:** `TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Where to find:** Twilio Console > Dashboard

#### TWILIO_AUTH_TOKEN
- **Description:** Twilio authentication token
- **Format:** 32-character string
- **Example:** `TWILIO_AUTH_TOKEN=your_auth_token_here`
- **Where to find:** Twilio Console > Dashboard

#### TWILIO_PHONE_NUMBER
- **Description:** Your Twilio phone number with SMS capability
- **Format:** E.164 format (+1234567890)
- **Example:** `TWILIO_PHONE_NUMBER=+12345678900`
- **Where to find:** Twilio Console > Phone Numbers

---

### Admin Configuration

#### ADMIN_PHONE_NUMBER
- **Description:** Phone number for admin access
- **Format:** E.164 format (+1234567890)
- **Fixed Value:** `+14034783995`
- **Example:** `ADMIN_PHONE_NUMBER=+14034783995`
- **Note:** This is the only phone number that gets admin role

---

### Firebase/Firestore Configuration

#### FIREBASE_PROJECT_ID
- **Description:** Firebase project identifier
- **Format:** Lowercase with hyphens
- **Example:** `FIREBASE_PROJECT_ID=your-project-id`
- **Where to find:** Firebase Console > Project Settings > General

#### FIREBASE_PRIVATE_KEY
- **Description:** Firebase service account private key
- **Format:** RSA private key with newlines as `\n`
- **Important:** Keep the quotes and `\n` characters
- **Example:**
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0...\n-----END PRIVATE KEY-----\n"
  ```
- **Where to find:**
  1. Firebase Console > Project Settings > Service Accounts
  2. Generate New Private Key
  3. Open downloaded JSON file
  4. Copy the `private_key` field value

#### FIREBASE_CLIENT_EMAIL
- **Description:** Firebase service account email
- **Format:** something@projectid.iam.gserviceaccount.com
- **Example:** `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
- **Where to find:** Same JSON file as private key, field: `client_email`

---

### Optional Variables

#### RAPIDAPI_KEY
- **Description:** RapidAPI key for Zillow integration
- **Status:** Optional (for property search enhancement)
- **Example:** `RAPIDAPI_KEY=your-rapidapi-key-here`
- **Where to get:**
  1. Sign up at https://rapidapi.com
  2. Subscribe to Zillow API
  3. Copy API key from dashboard

---

## .env File Template

Create a `.env` file in the project root with this content:

```env
# ============================================
# Server Configuration
# ============================================
NODE_ENV=development
PORT=3000
SESSION_SECRET=generate-a-strong-random-32-character-secret-key

# ============================================
# Twilio SMS Configuration
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900

# ============================================
# Admin Configuration
# ============================================
ADMIN_PHONE_NUMBER=+14034783995

# ============================================
# Firebase/Firestore Configuration
# ============================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here (keep the \\n)\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# ============================================
# Optional: Zillow API Integration
# ============================================
RAPIDAPI_KEY=your-rapidapi-key-here
```

---

## Environment-Specific Settings

### Development
```env
NODE_ENV=development
PORT=3000
# OTP codes are logged to console
# Sessions use HTTP (not HTTPS)
```

### Production
```env
NODE_ENV=production
PORT=3000  # or use process.env.PORT from hosting provider
# OTP codes sent via Twilio
# Sessions require HTTPS (secure cookies)
```

---

## Security Best Practices

### ✅ DO:
- Use strong random SESSION_SECRET (32+ characters)
- Keep .env file in .gitignore
- Rotate secrets regularly
- Use different credentials for dev/prod
- Store production secrets in secure vault (AWS Secrets Manager, etc.)

### ❌ DON'T:
- Commit .env to version control
- Share credentials in plain text
- Use default/weak secrets
- Hardcode secrets in source code
- Use same credentials across environments

---

## Verification Checklist

Before running the application, verify:

- [ ] All required variables are set
- [ ] No placeholder values remaining
- [ ] FIREBASE_PRIVATE_KEY has proper `\n` newlines
- [ ] Phone numbers are in E.164 format (+1234567890)
- [ ] SESSION_SECRET is at least 32 characters
- [ ] Twilio credentials are from active account
- [ ] Firebase project has Firestore enabled

---

## Testing Configuration

### Test Twilio Setup:
```bash
# OTP codes will be logged to console in development
# Look for: "🔐 OTP Code for +1234567890: 123456"
```

### Test Firebase Connection:
```bash
# Start server and check logs for:
# - No Firebase connection errors
# - Collections initialized successfully
```

### Common Issues:

**Issue:** "Firebase private key error"
- Check that `\n` characters are present in FIREBASE_PRIVATE_KEY
- Ensure the key is wrapped in double quotes
- Verify no line breaks in the middle of the key

**Issue:** "Twilio authentication failed"
- Verify TWILIO_ACCOUNT_SID starts with "AC"
- Check AUTH_TOKEN is copied correctly
- Ensure phone number includes country code

**Issue:** "Session error"
- Generate a new SESSION_SECRET with: `openssl rand -base64 32`
- Ensure it's at least 32 characters

---

## Environment Variable Loading

Variables are loaded automatically from `.env` file using Node.js:

```typescript
// Access in code:
const port = process.env.PORT || 3000;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
```

The `.env` file is read at application startup. Changes require server restart.

---

**Last Updated:** Phase 4 Complete

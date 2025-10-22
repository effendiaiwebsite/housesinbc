# Deployment Guide - Houses BC

This guide covers deploying the Houses BC web application (frontend + backend together) to Render.com.

## Prerequisites

- GitHub account
- Render.com account (free tier works)
- Your Firebase and Twilio credentials

## Deployment Steps

### 1. Push Code to GitHub (if not already done)

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 2. Deploy to Render.com

1. **Sign up/Login to Render**: Go to https://render.com and sign up or log in

2. **Create New Web Service**:
   - Click "New +" button → "Web Service"
   - Connect your GitHub account if not already connected
   - Select the `housesinbc` repository

3. **Configure the Service**:
   - **Name**: `houses-bc` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`

4. **Set Environment Variables** (very important!):
   Click "Advanced" → Add Environment Variables:

   ```
   NODE_ENV=production
   TWILIO_ACCOUNT_SID=<your-twilio-sid>
   TWILIO_AUTH_TOKEN=<your-twilio-token>
   TWILIO_PHONE_NUMBER=<your-twilio-number>
   FIREBASE_PROJECT_ID=<your-firebase-project-id>
   FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
   FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
   ADMIN_PHONE=+14034783995
   PORT=3000
   ```

   **Note**: Render will auto-generate SESSION_SECRET if you don't provide one.

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the build to complete (5-10 minutes)
   - Once deployed, you'll get a URL like: `https://houses-bc-xxxxx.onrender.com`

### 3. Alternative: Use render.yaml (Automatic)

The project includes a `render.yaml` file for Infrastructure as Code deployment:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml`
5. Add the environment variables when prompted
6. Click "Apply"

### 4. Test Your Deployment

After deployment, test these endpoints:

- **Health Check**: `https://your-app.onrender.com/api/health`
- **Frontend**: `https://your-app.onrender.com`
- **API Base**: `https://your-app.onrender.com/api`

## For Mobile App Integration

Once deployed, update your Flutter mobile app configuration:

1. Open: `houses_bc_mobile/lib/core/config/app_config.dart`

2. Update the production URL:
```dart
static String get baseUrl {
  if (kIsWeb) {
    return 'http://localhost:3000/api';
  } else {
    // Use deployed backend for mobile
    return 'https://your-app.onrender.com/api';
  }
}
```

3. Rebuild your mobile app:
```bash
cd houses_bc_mobile
flutter build apk --release
```

## Important Notes

### Free Tier Limitations
- **Cold Starts**: Free tier apps sleep after 15 minutes of inactivity
- **Spin-up Time**: First request after sleep takes ~30 seconds
- **Monthly Hours**: 750 hours/month (upgradeable with payment)

### Alternative Hosting Options

If you prefer other platforms:

**Railway.app**:
```bash
railway login
railway init
railway up
```

**Fly.io**:
```bash
fly launch
fly deploy
```

**Heroku**:
```bash
heroku create houses-bc
git push heroku main
```

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility (16+)
- Check build logs in Render dashboard

### App Crashes
- Check environment variables are set correctly
- View logs in Render dashboard
- Ensure Firebase private key is properly escaped

### 502 Bad Gateway
- App may be starting up (wait 30-60 seconds)
- Check if port is set correctly (PORT=3000)
- Verify start command is correct

### CORS Issues
- The app is configured to allow all origins
- If issues persist, check Render logs
- Verify mobile app is using correct URL

## Next Steps

After successful deployment:
1. Update mobile app with production URL
2. Build and test APK
3. Share deployed URL for testing
4. Consider upgrading to paid tier for production use

## Support

For issues:
- Check Render logs: Dashboard → Service → Logs
- Review build logs for errors
- Test API endpoints with curl or Postman

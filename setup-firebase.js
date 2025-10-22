/**
 * Firebase Credentials Setup Helper
 *
 * This script helps you properly format your Firebase service account credentials
 * for use in the .env file.
 *
 * Usage:
 * 1. Download your service account JSON file from Firebase Console
 * 2. Run: node setup-firebase.js path/to/your-service-account.json
 * 3. Copy the output to your .env file
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ No JSON file provided');
  console.log('\n📝 Usage:');
  console.log('  node setup-firebase.js path/to/your-service-account.json');
  console.log('\n📥 Download your service account JSON:');
  console.log('  1. Go to: https://console.firebase.google.com/');
  console.log('  2. Select your project: rida-ad632');
  console.log('  3. Click gear icon → Project settings');
  console.log('  4. Go to "Service accounts" tab');
  console.log('  5. Click "Generate new private key"');
  console.log('  6. Download the JSON file');
  process.exit(1);
}

const jsonPath = path.resolve(args[0]);

if (!fs.existsSync(jsonPath)) {
  console.log(`❌ File not found: ${jsonPath}`);
  process.exit(1);
}

try {
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const serviceAccount = JSON.parse(jsonContent);

  console.log('\n✅ Service account JSON loaded successfully!');
  console.log('\n📋 Add these lines to your .env file:\n');
  console.log('# Firebase/Firestore Configuration');
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log('\n✅ Copy the above lines to your .env file');
  console.log('⚠️  Make sure to keep the quotes around FIREBASE_PRIVATE_KEY');

} catch (error) {
  console.log('❌ Error reading JSON file:', error.message);
  process.exit(1);
}

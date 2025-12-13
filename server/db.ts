/**
 * Firestore Database Configuration
 *
 * This module sets up Firebase Admin SDK for Firestore database access.
 * All database operations go through this connection.
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('🔧 Firebase Config Debug:');
  console.log('- Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('- Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('- Private Key exists:', !!privateKey);
  console.log('- Private Key length:', privateKey?.length || 0);
  console.log('- Private Key starts with:', privateKey?.substring(0, 30));

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });

  console.log('✅ Firebase Admin initialized');
}

export const db = admin.firestore();
export const auth = admin.auth();

// Export admin for Firebase Auth verification
export { admin };

// Firestore collections references
export const collections = {
  leads: db.collection('leads'),
  appointments: db.collection('appointments'),
  webinarSignups: db.collection('webinar_signups'),
  newsletters: db.collection('newsletters'),
  blogs: db.collection('blogs'),
  properties: db.collection('properties'),
  neighborhoods: db.collection('neighborhoods'),
  otpCodes: db.collection('otp_codes'),
  users: db.collection('users'),
  savedProperties: db.collection('saved_properties'),
  chatSessions: db.collection('chat_sessions'),
  chatMessages: db.collection('chat_messages'),
  chatKnowledge: db.collection('chat_knowledge'),
  chatbotSettings: db.collection('chatbot_settings'),
  progress: db.collection('progress'),
  quizResponses: db.collection('quiz_responses'),
};

export default db;

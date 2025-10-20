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

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

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
};

export default db;

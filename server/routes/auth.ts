/**
 * Authentication Routes
 *
 * Handles OTP-based authentication for both admin and client users.
 */

import { Router, Request, Response } from 'express';
import { collections, admin } from '../db';
import { generateOTP, sendOTP, isValidPhoneNumber } from '../sms';
import { sendOTPSchema, verifyOTPSchema } from '../../shared/schema';
import { validateBody } from '../middleware';

const router = Router();

const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER || '+14034783995';
const ADMIN_EMAIL = 'satindersandhu138@gmail.com';
const OTP_EXPIRY_MINUTES = 10;

/**
 * POST /api/auth/send-otp
 * Generate and send OTP code to phone number
 */
router.post('/send-otp', validateBody(sendOTPSchema), async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)',
      });
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in Firestore
    await collections.otpCodes.add({
      phoneNumber,
      code,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    // Send SMS
    const sent = await sendOTP(phoneNumber, code);

    if (!sent) {
      return res.status(500).json({
        error: 'Failed to send OTP. Please try again.',
      });
    }

    // Clean up old expired OTP codes for this phone number (non-blocking)
    // Do this after sending response to avoid index errors blocking the success response
    setTimeout(async () => {
      try {
        const allCodes = await collections.otpCodes
          .where('phoneNumber', '==', phoneNumber)
          .get();

        const now = new Date();
        const deletePromises = allCodes.docs
          .filter(doc => {
            const data = doc.data();
            const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt;
            return expiresAt < now;
          })
          .map(doc => doc.ref.delete());

        await Promise.all(deletePromises);
      } catch (cleanupError) {
        console.log('OTP cleanup error (non-critical):', cleanupError);
      }
    }, 100);

    return res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      error: 'Failed to send OTP',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and create session
 */
router.post('/verify-otp', validateBody(verifyOTPSchema), async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code } = req.body;

    // Find all OTP codes for this phone number (avoiding compound index requirement)
    const otpSnapshot = await collections.otpCodes
      .where('phoneNumber', '==', phoneNumber)
      .get();

    // Filter in code to avoid needing composite index
    const now = new Date();
    const validOtp = otpSnapshot.docs.find(doc => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);

      return (
        data.code === code &&
        data.used === false &&
        expiresAt > now
      );
    });

    if (!validOtp) {
      return res.status(401).json({
        error: 'Invalid or expired OTP code',
        message: 'Please request a new code and try again',
      });
    }

    // Mark OTP as used
    await validOtp.ref.update({ used: true });

    // Get login type from request (admin or client)
    const loginType = req.body.loginType || 'client'; // Default to client

    console.log('🔐 AUTH FLOW - verifyOTP:');
    console.log('  - Phone:', phoneNumber);
    console.log('  - loginType from request:', req.body.loginType);
    console.log('  - loginType used:', loginType);

    // For admin login, verify it's the admin phone number
    if (loginType === 'admin' && phoneNumber !== ADMIN_PHONE_NUMBER) {
      console.log('  ❌ Access denied - not admin phone number');
      return res.status(403).json({
        error: 'Access denied',
        message: 'This phone number is not authorized for admin access',
      });
    }

    // For admin login, role is always admin
    // For client login, role is always client (even if it's the admin's phone number)
    const role = loginType === 'admin' ? 'admin' : 'client';
    console.log('  - Role assigned:', role);

    // Find or create user with the specified role
    // For client portal, we want a separate user document even for admin's phone number
    const userSnapshot = await collections.users
      .where('phoneNumber', '==', phoneNumber)
      .where('role', '==', role)
      .limit(1)
      .get();

    let userId: string;
    let userName: string | undefined;

    if (userSnapshot.empty) {
      // Create new user with the specified role
      console.log('  - Creating NEW user with role:', role);
      const newUserRef = await collections.users.add({
        phoneNumber,
        role,
        verified: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = newUserRef.id;
      console.log('  - New user created, ID:', userId);
    } else {
      // Update existing user
      console.log('  - Found EXISTING user with role:', role);
      const userDoc = userSnapshot.docs[0];
      userId = userDoc.id;
      userName = userDoc.data().name;
      console.log('  - Existing user ID:', userId);
      await userDoc.ref.update({
        verified: true,
        lastLogin: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create session
    req.session.userId = userId;
    req.session.phoneNumber = phoneNumber;
    req.session.role = role;
    req.session.userName = userName;
    req.session.isAuthenticated = true;

    console.log('  ✅ Session created:');
    console.log('     - userId:', userId);
    console.log('     - role:', role);
    console.log('     - phoneNumber:', phoneNumber);

    return res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        phoneNumber,
        role,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      error: 'Failed to verify OTP',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/auth/status
 * Check current authentication status
 */
router.get('/status', (req: Request, res: Response) => {
  if (req.session?.isAuthenticated) {
    return res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.email,
        phoneNumber: req.session.phoneNumber,
        role: req.session.role,
        name: req.session.userName,
      },
    });
  }

  return res.json({
    authenticated: false,
  });
});

/**
 * POST /api/auth/logout
 * Destroy session and log out
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({
        error: 'Failed to log out',
      });
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

/**
 * POST /api/auth/google-signin
 * Firebase Google Sign-In
 */
router.post('/google-signin', async (req: Request, res: Response) => {
  try {
    const { idToken, email, name, loginType } = req.body;

    console.log('🔐 FIREBASE AUTH - Google Sign-In:');
    console.log('  - email:', email);
    console.log('  - loginType:', loginType);

    if (!idToken || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'idToken and email are required',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('  ✅ Firebase token verified');

    // Determine role based on email and loginType
    const role = (loginType === 'admin' || email === ADMIN_EMAIL) ? 'admin' : 'client';
    console.log('  - Role assigned:', role);

    // Find or create user
    const userSnapshot = await collections.users
      .where('email', '==', email)
      .where('role', '==', role)
      .limit(1)
      .get();

    let userId: string;

    if (userSnapshot.empty) {
      // Create new user
      console.log('  - Creating NEW user');
      const newUserRef = await collections.users.add({
        email,
        name: name || decodedToken.name,
        role,
        verified: true,
        firebaseUid: decodedToken.uid,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = newUserRef.id;
      console.log('  - New user created, ID:', userId);
    } else {
      // Update existing user
      console.log('  - Found EXISTING user');
      const userDoc = userSnapshot.docs[0];
      userId = userDoc.id;
      await userDoc.ref.update({
        verified: true,
        lastLogin: new Date(),
        updatedAt: new Date(),
        firebaseUid: decodedToken.uid,
      });
    }

    // Create session
    req.session.userId = userId;
    req.session.email = email;
    req.session.role = role;
    req.session.userName = name || decodedToken.name;
    req.session.isAuthenticated = true;

    console.log('  ✅ Session created');

    return res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        email,
        role,
        name: name || decodedToken.name,
        verified: true,
        phoneNumber: null,
      },
    });
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/email-signin
 * Firebase Email/Password Sign-In
 */
router.post('/email-signin', async (req: Request, res: Response) => {
  try {
    const { idToken, email, loginType } = req.body;

    console.log('🔐 FIREBASE AUTH - Email Sign-In:');
    console.log('  - email:', email);
    console.log('  - loginType:', loginType);

    if (!idToken || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'idToken and email are required',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('  ✅ Firebase token verified');

    // Determine role
    const role = (loginType === 'admin' || email === ADMIN_EMAIL) ? 'admin' : 'client';
    console.log('  - Role assigned:', role);

    // Find user
    const userSnapshot = await collections.users
      .where('email', '==', email)
      .where('role', '==', role)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      console.log('  ❌ User not found');
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email. Please sign up first.',
      });
    }

    // Update existing user
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    await userDoc.ref.update({
      verified: true,
      lastLogin: new Date(),
      updatedAt: new Date(),
      firebaseUid: decodedToken.uid,
    });

    // Create session
    req.session.userId = userId;
    req.session.email = email;
    req.session.role = role;
    req.session.userName = userData.name;
    req.session.isAuthenticated = true;

    console.log('  ✅ Session created');

    return res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        email,
        role,
        name: userData.name,
      },
    });
  } catch (error) {
    console.error('❌ Email sign-in error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/email-signup
 * Firebase Email/Password Sign-Up
 */
router.post('/email-signup', async (req: Request, res: Response) => {
  try {
    const { idToken, email, name, loginType } = req.body;

    console.log('🔐 FIREBASE AUTH - Email Sign-Up:');
    console.log('  - email:', email);
    console.log('  - loginType:', loginType);

    if (!idToken || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'idToken and email are required',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('  ✅ Firebase token verified');

    // Determine role
    const role = (loginType === 'admin' || email === ADMIN_EMAIL) ? 'admin' : 'client';
    console.log('  - Role assigned:', role);

    // Check if user already exists
    const existingUserSnapshot = await collections.users
      .where('email', '==', email)
      .where('role', '==', role)
      .limit(1)
      .get();

    if (!existingUserSnapshot.empty) {
      console.log('  ⚠️  User already exists');
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Create new user
    console.log('  - Creating NEW user');
    const newUserRef = await collections.users.add({
      email,
      name: name || decodedToken.name,
      role,
      verified: true,
      firebaseUid: decodedToken.uid,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = newUserRef.id;
    console.log('  - New user created, ID:', userId);

    // Create session
    req.session.userId = userId;
    req.session.email = email;
    req.session.role = role;
    req.session.userName = name || decodedToken.name;
    req.session.isAuthenticated = true;

    console.log('  ✅ Session created');

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        email,
        role,
        name: name || decodedToken.name,
      },
    });
  } catch (error) {
    console.error('❌ Email sign-up error:', error);
    return res.status(400).json({
      error: 'Sign up failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

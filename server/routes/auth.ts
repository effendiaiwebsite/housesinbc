/**
 * Authentication Routes
 *
 * Handles OTP-based authentication for both admin and client users.
 */

import { Router, Request, Response } from 'express';
import { collections } from '../db';
import { generateOTP, sendOTP, isValidPhoneNumber } from '../sms';
import { sendOTPSchema, verifyOTPSchema } from '../../shared/schema';
import { validateBody } from '../middleware';

const router = Router();

const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER || '+14034783995';
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

    // Determine if user is admin
    const isAdmin = phoneNumber === ADMIN_PHONE_NUMBER;
    const role = isAdmin ? 'admin' : 'client';

    // Find or create user
    const userSnapshot = await collections.users
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    let userId: string;

    if (userSnapshot.empty) {
      // Create new user
      const newUserRef = await collections.users.add({
        phoneNumber,
        role,
        verified: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = newUserRef.id;
    } else {
      // Update existing user
      const userDoc = userSnapshot.docs[0];
      userId = userDoc.id;
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
    req.session.isAuthenticated = true;

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
        phoneNumber: req.session.phoneNumber,
        role: req.session.role,
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

export default router;

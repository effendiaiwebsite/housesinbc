/**
 * Data Deletion Request Route
 *
 * Handles user requests to delete their personal data.
 * Required by Google Play Store policy and PIPEDA/PIPA (Canadian privacy law).
 *
 * POST /api/data-deletion-request
 *   - Stores the request in Firestore (deletion_requests collection)
 *   - Admin can view and process requests from Firebase Console
 */

import { Router, Request, Response } from 'express';
import { collections } from '../db';

const router = Router();

/**
 * POST /api/data-deletion-request
 * Submit a data deletion request.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, reason } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // Check for a duplicate pending request from this email in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await collections.deletionRequests
      .where('email', '==', email.toLowerCase().trim())
      .where('status', '==', 'pending')
      .where('createdAt', '>=', oneDayAgo)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(200).json({
        success: true,
        message: 'A deletion request for this email was already submitted. We will process it within 30 days.',
        alreadyExists: true,
      });
    }

    // Store the request
    await collections.deletionRequests.add({
      email: email.toLowerCase().trim(),
      reason: reason?.trim() || null,
      status: 'pending',          // pending | processing | completed
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Your deletion request has been received. We will delete your data within 30 days and send a confirmation to your email.',
    });
  } catch (error) {
    console.error('Data deletion request error:', error);
    return res.status(500).json({ error: 'Failed to submit request. Please try again or email privacy@housesinbc.com directly.' });
  }
});

export default router;

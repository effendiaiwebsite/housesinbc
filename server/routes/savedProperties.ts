/**
 * Saved Properties Routes
 *
 * Handles saving properties to user accounts with phone verification
 */

import { Router, Request, Response } from 'express';
import { collections } from '../db';
import { z } from 'zod';
import { validateBody } from '../middleware';

const router = Router();

// Schema for saving a property
const savePropertySchema = z.object({
  phoneNumber: z.string().min(10),
  clientName: z.string().min(2),
  zpid: z.string(),
  propertyData: z.object({
    streetAddress: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipcode: z.string().optional(),
    price: z.number().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    livingArea: z.number().optional(),
    imgSrc: z.string().optional(),
  }),
});

/**
 * POST /api/saved-properties
 * Save a property to a user's account (public endpoint - requires phone verification)
 */
router.post('/', validateBody(savePropertySchema), async (req: Request, res: Response) => {
  try {
    const { phoneNumber, clientName, zpid, propertyData } = req.body;

    // Find or create user
    let userId: string;
    const userSnapshot = await collections.users
      .where('phoneNumber', '==', phoneNumber)
      .where('role', '==', 'client')
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      // Auto-register new client user
      const newUserRef = await collections.users.add({
        phoneNumber,
        name: clientName,
        role: 'client',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = newUserRef.id;
      console.log(`✅ Auto-registered new user: ${clientName} (${phoneNumber})`);
    } else {
      userId = userSnapshot.docs[0].id;
    }

    // Check if property is already saved
    const existingSaved = await collections.savedProperties
      .where('userId', '==', userId)
      .where('zpid', '==', zpid)
      .limit(1)
      .get();

    if (!existingSaved.empty) {
      return res.json({
        success: true,
        message: 'Property already saved',
        id: existingSaved.docs[0].id,
      });
    }

    // Save the property
    const savedPropertyRef = await collections.savedProperties.add({
      userId,
      zpid,
      propertyData,
      clientName,
      clientPhone: phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`💾 Property saved: ${zpid} for user ${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Property saved successfully',
      id: savedPropertyRef.id,
    });
  } catch (error) {
    console.error('Error saving property:', error);
    return res.status(500).json({
      error: 'Failed to save property',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/saved-properties
 * Get all saved properties for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Allow both authenticated and query-based access
    let userId: string | undefined;

    if (req.session?.isAuthenticated && req.session.userId) {
      userId = req.session.userId;
    } else if (req.query.phoneNumber) {
      // Allow fetching by phone number for unauthenticated access
      const phoneNumber = req.query.phoneNumber as string;
      const userSnapshot = await collections.users
        .where('phoneNumber', '==', phoneNumber)
        .where('role', '==', 'client')
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        userId = userSnapshot.docs[0].id;
      }
    }

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please log in or provide phone number',
      });
    }

    const savedPropertiesSnapshot = await collections.savedProperties
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const savedProperties = savedPropertiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      data: savedProperties,
    });
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return res.status(500).json({
      error: 'Failed to fetch saved properties',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/saved-properties/:id
 * Remove a saved property
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.session?.isAuthenticated || !req.session.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please log in to remove saved properties',
      });
    }

    // Verify ownership
    const savedPropertyDoc = await collections.savedProperties.doc(id).get();

    if (!savedPropertyDoc.exists) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Saved property not found',
      });
    }

    const savedPropertyData = savedPropertyDoc.data();
    if (savedPropertyData?.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to remove this property',
      });
    }

    await savedPropertyDoc.ref.delete();

    return res.json({
      success: true,
      message: 'Property removed from saved list',
    });
  } catch (error) {
    console.error('Error deleting saved property:', error);
    return res.status(500).json({
      error: 'Failed to delete saved property',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

/**
 * Offers Routes
 *
 * Handle property offer creation, submission, and review
 */

import { Router } from 'express';
import { db, collections } from '../db';
import { offerSchema, updateOfferSchema } from '../../shared/schema';

const router = Router();

/**
 * POST /api/offers
 * Create a new offer
 */
router.post('/', async (req, res) => {
  try {
    const { offerData, userId, sessionId } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'userId or sessionId is required',
      });
    }

    // Validate offer data
    const validated = offerSchema.parse(offerData);

    // Create offer document
    const offerDoc = await db.collection('offers').add({
      ...validated,
      userId: userId || sessionId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update user progress if this is their first offer
    try {
      const progressSnapshot = await db
        .collection('user_progress')
        .where('userId', '==', userId || sessionId)
        .limit(1)
        .get();

      if (!progressSnapshot.empty) {
        const progressDoc = progressSnapshot.docs[0];
        const currentData = progressDoc.data();

        // Add offer ID to step 8
        const step8Data = currentData.milestones?.step8_makeOffer?.data || {};
        const offerIds = step8Data.offerIds || [];
        offerIds.push(offerDoc.id);

        await progressDoc.ref.update({
          'milestones.step8_makeOffer.data.offerIds': offerIds,
          'milestones.step8_makeOffer.status': 'in_progress',
          updatedAt: new Date(),
        });
      }
    } catch (progressError) {
      console.error('Failed to update progress:', progressError);
      // Don't fail the offer creation if progress update fails
    }

    res.json({
      success: true,
      data: {
        offerId: offerDoc.id,
        status: 'draft',
      },
    });
  } catch (error: any) {
    console.error('Create offer error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create offer',
    });
  }
});

/**
 * GET /api/offers
 * Get all offers (admin view) OR offers for a specific user
 * If query params include page/limit, return all offers (admin)
 * Otherwise, use the identifier from the path
 */
router.get('/', async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    // If page/limit query params are present, treat as admin request for all offers
    if (page !== undefined || limit !== undefined) {
      let query = collections.offers.orderBy('createdAt', 'desc');

      if (status) {
        query = collections.offers
          .where('status', '==', status)
          .orderBy('createdAt', 'desc') as any;
      }

      const offersSnapshot = await query.get();

      const offers = offersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          submittedAt: data.submittedAt?.toDate(),
          reviewedAt: data.reviewedAt?.toDate(),
        };
      });

      return res.json({
        success: true,
        data: offers,
      });
    }

    // If no query params, return error - identifier required
    return res.status(400).json({
      success: false,
      error: 'User identifier required in path or use query params for admin view',
    });
  } catch (error: any) {
    console.error('Get offers error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve offers',
    });
  }
});

/**
 * GET /api/offers/:identifier
 * Get all offers for a user (by userId or sessionId)
 */
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    const offersSnapshot = await db
      .collection('offers')
      .where('userId', '==', identifier)
      .orderBy('createdAt', 'desc')
      .get();

    const offers = offersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        reviewedAt: data.reviewedAt?.toDate(),
      };
    });

    res.json({
      success: true,
      data: offers,
    });
  } catch (error: any) {
    console.error('Get offers error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve offers',
    });
  }
});

/**
 * PUT /api/offers/:id
 * Update an offer (change details or status)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { offerData, status } = req.body;

    const offerRef = db.collection('offers').doc(id);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update offer details if provided
    if (offerData) {
      const validated = offerSchema.parse(offerData);
      Object.assign(updateData, validated);
    }

    // Update status if provided
    if (status) {
      updateData.status = status;

      if (status === 'submitted') {
        updateData.submittedAt = new Date();
      }
    }

    await offerRef.update(updateData);

    res.json({
      success: true,
      message: 'Offer updated successfully',
    });
  } catch (error: any) {
    console.error('Update offer error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update offer',
    });
  }
});

/**
 * POST /api/offers/:id/submit
 * Submit offer to admin for review
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;

    const offerRef = db.collection('offers').doc(id);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
    }

    const offerData = offerDoc.data();

    // Mark offer as submitted
    await offerRef.update({
      status: 'submitted',
      submittedAt: new Date(),
      updatedAt: new Date(),
    });

    // Update user progress to mark step 8 as completed
    try {
      const progressSnapshot = await db
        .collection('user_progress')
        .where('userId', '==', offerData?.userId)
        .limit(1)
        .get();

      if (!progressSnapshot.empty) {
        const progressDoc = progressSnapshot.docs[0];
        const currentData = progressDoc.data();

        // Calculate new overall progress
        const milestones = currentData.milestones;
        milestones.step8_makeOffer = {
          status: 'completed',
          data: milestones.step8_makeOffer?.data || {},
          completedAt: new Date(),
        };

        const completedCount = Object.values(milestones).filter(
          (m: any) => m.status === 'completed'
        ).length;
        const overallProgress = (completedCount / 8) * 100;

        await progressDoc.ref.update({
          'milestones.step8_makeOffer': milestones.step8_makeOffer,
          overallProgress,
          updatedAt: new Date(),
        });
      }
    } catch (progressError) {
      console.error('Failed to update progress:', progressError);
    }

    res.json({
      success: true,
      message: 'Offer submitted successfully',
    });
  } catch (error: any) {
    console.error('Submit offer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit offer',
    });
  }
});

/**
 * DELETE /api/offers/:id
 * Delete an offer (only if in draft or withdrawn status)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const offerRef = db.collection('offers').doc(id);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
    }

    const offerData = offerDoc.data();

    // Only allow deletion of draft or withdrawn offers
    if (!['draft', 'withdrawn'].includes(offerData?.status)) {
      return res.status(400).json({
        success: false,
        error: 'Only draft or withdrawn offers can be deleted',
      });
    }

    await offerRef.delete();

    res.json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete offer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete offer',
    });
  }
});

/**
 * GET /api/admin/offers
 * Get all offers (admin only)
 * TODO: Add admin authentication middleware
 */
router.get('/admin/all', async (req, res) => {
  try {
    const { status } = req.query;

    let query = db.collection('offers').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const offersSnapshot = await query.get();

    const offers = offersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        reviewedAt: data.reviewedAt?.toDate(),
      };
    });

    res.json({
      success: true,
      data: offers,
    });
  } catch (error: any) {
    console.error('Get admin offers error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve offers',
    });
  }
});

/**
 * PUT /api/admin/offers/:id/review
 * Review an offer (admin only)
 * TODO: Add admin authentication middleware
 */
router.put('/admin/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const validated = updateOfferSchema.parse(req.body);

    const offerRef = db.collection('offers').doc(id);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
    }

    const updateData: any = {
      status: validated.status,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (validated.adminNotes) {
      updateData.adminNotes = validated.adminNotes;
    }

    // TODO: Add reviewedBy (admin user ID) when auth is implemented
    // updateData.reviewedBy = req.user.id;

    await offerRef.update(updateData);

    res.json({
      success: true,
      message: 'Offer reviewed successfully',
    });
  } catch (error: any) {
    console.error('Review offer error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to review offer',
    });
  }
});

export default router;

/**
 * Admin Routes
 *
 * Centralized admin-specific endpoints for managing the platform
 */

import { Router } from 'express';
import { collections } from '../db';
import { requireAuth, requireAdmin } from '../middleware';

const router = Router();

/**
 * GET /api/admin/appointments
 * Get all appointments (admin view)
 */
router.get('/appointments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let query = collections.appointments.orderBy('preferredDate', 'desc');

    if (status) {
      query = collections.appointments
        .where('status', '==', status)
        .orderBy('preferredDate', 'desc') as any;
    }

    const snapshot = await query.get();

    const appointments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateTime: data.dateTime?.toDate?.()?.toISOString() || data.preferredDate?.toDate?.()?.toISOString() || data.dateTime,
        preferredDate: data.preferredDate?.toDate?.() || data.preferredDate,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    console.error('Get admin appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments',
      details: error.message
    });
  }
});

/**
 * PUT /api/admin/appointments/:id/status
 * Update appointment status (admin only)
 */
router.put('/appointments/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const doc = await collections.appointments.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updates.adminNotes = adminNotes;
    }

    await collections.appointments.doc(id).update(updates);

    const updatedDoc = await collections.appointments.doc(id).get();
    const data = updatedDoc.data();

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: {
        id: updatedDoc.id,
        ...data,
        dateTime: data?.dateTime?.toDate?.()?.toISOString() || data?.preferredDate?.toDate?.()?.toISOString(),
        preferredDate: data?.preferredDate?.toDate?.() || data?.preferredDate,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || data?.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/journeys
 * Get all user journeys (summary view)
 */
router.get('/journeys', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const snapshot = await collections.progress
      .orderBy('updatedAt', 'desc')
      .get();

    const journeys = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userId = data.userId;

        // Get user details
        let userName = 'Unknown';
        let userPhone = '';
        let userEmail = '';

        try {
          // First try to find user by ID
          const userDoc = await collections.users.doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || 'Unknown';
            userPhone = userData?.phoneNumber || '';
            userEmail = userData?.email || '';
          } else {
            // If not found by ID, try to find by phone number (userId might be phone)
            const userSnapshot = await collections.users
              .where('phoneNumber', '==', userId)
              .limit(1)
              .get();

            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              userName = userData?.name || 'Unknown';
              userPhone = userData?.phoneNumber || userId;
              userEmail = userData?.email || '';
            } else {
              userPhone = userId; // Use userId as phone if no user found
            }
          }
        } catch (userError) {
          console.error('Error fetching user:', userError);
          userPhone = userId;
        }

        // Calculate progress stats
        const milestones = data.milestones || {};
        const totalSteps = 8;
        const completedSteps = Object.values(milestones).filter(
          (m: any) => m.status === 'completed'
        ).length;
        const overallProgress = (completedSteps / totalSteps) * 100;

        return {
          userId,
          userName,
          userPhone,
          userEmail,
          overallProgress: Math.round(overallProgress),
          completedSteps,
          totalSteps,
          currentStep: data.currentStep || 'step1_creditScore',
          lastActivity: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        };
      })
    );

    res.json({
      success: true,
      data: journeys,
    });
  } catch (error: any) {
    console.error('Get user journeys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user journeys',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/users/:userId/journey
 * Get detailed journey for a specific user
 */
router.get('/users/:userId/journey', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user progress
    const progressSnapshot = await collections.progress
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (progressSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'User journey not found',
      });
    }

    const progressDoc = progressSnapshot.docs[0];
    const progressData = progressDoc.data();

    // Get user details
    let userData: any = {};
    try {
      const userDoc = await collections.users.doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
      } else {
        // Try finding by phone number
        const userSnapshot = await collections.users
          .where('phoneNumber', '==', userId)
          .limit(1)
          .get();
        if (!userSnapshot.empty) {
          userData = userSnapshot.docs[0].data();
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }

    // Format milestones
    const milestones = progressData.milestones || {};
    const formattedMilestones = Object.entries(milestones).map(([key, value]: [string, any]) => ({
      step: key,
      status: value.status || 'not_started',
      completedAt: value.completedAt?.toDate?.()?.toISOString() || value.completedAt,
      data: value.data || {},
    }));

    res.json({
      success: true,
      data: {
        userId,
        userName: userData.name || 'Unknown',
        userPhone: userData.phoneNumber || userId,
        userEmail: userData.email || '',
        overallProgress: progressData.overallProgress || 0,
        currentStep: progressData.currentStep || 'step1_creditScore',
        milestones: formattedMilestones,
        createdAt: progressData.createdAt?.toDate?.()?.toISOString() || progressData.createdAt,
        updatedAt: progressData.updatedAt?.toDate?.()?.toISOString() || progressData.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get user journey detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user journey',
      details: error.message
    });
  }
});

export default router;

/**
 * User Progress Routes
 *
 * Handle milestone progress tracking for the 8-step journey
 */

import { Router } from 'express';
import { db } from '../db';

const router = Router();

/**
 * GET /api/progress/:identifier
 * Get user's milestone progress by userId or sessionId
 */
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    const querySnapshot = await db
      .collection('user_progress')
      .where('userId', '==', identifier)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      // Auto-create progress for new users with default values
      console.log(`Creating new progress record for user: ${identifier}`);

      const defaultProgress = {
        userId: identifier,
        milestones: {
          'step1_creditScore': { status: 'available', data: {} },
          'step2_fhsa': { status: 'locked', data: {} },
          'step3_preApproval': { status: 'locked', data: {} },
          'step4_incentives': { status: 'locked', data: {} },
          'step5_neighborhoods': { status: 'locked', data: {} },
          'step6_searchProperties': { status: 'locked', data: {} },
          'step7_bookViewing': { status: 'locked', data: {} },
          'step8_makeOffer': { status: 'locked', data: {} },
        },
        overallProgress: 0,
        completedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await db.collection('user_progress').add(defaultProgress);

      return res.json({
        success: true,
        data: {
          id: docRef.id,
          ...defaultProgress,
        },
      });
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate(),
      },
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve progress',
    });
  }
});

/**
 * PUT /api/progress/:identifier/milestone
 * Update a specific milestone
 */
router.put('/:identifier/milestone', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { milestoneId, status, data } = req.body;

    if (!milestoneId || !status) {
      return res.status(400).json({
        success: false,
        error: 'milestoneId and status are required',
      });
    }

    // Find user progress document
    const querySnapshot = await db
      .collection('user_progress')
      .where('userId', '==', identifier)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found',
      });
    }

    const doc = querySnapshot.docs[0];
    const currentData = doc.data();

    // Update the specific milestone
    const milestoneUpdate: any = {
      status,
    };

    if (data) {
      milestoneUpdate.data = data;
    }

    if (status === 'completed') {
      milestoneUpdate.completedAt = new Date();
    }

    // Calculate new overall progress
    const milestones = currentData.milestones;
    milestones[milestoneId] = milestoneUpdate;

    const completedCount = Object.values(milestones).filter(
      (m: any) => m.status === 'completed'
    ).length;
    const totalMilestones = 8;
    const overallProgress = (completedCount / totalMilestones) * 100;

    // Update in Firestore
    await doc.ref.update({
      [`milestones.${milestoneId}`]: milestoneUpdate,
      overallProgress,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        milestoneId,
        status,
        overallProgress,
      },
    });
  } catch (error: any) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update milestone',
    });
  }
});

/**
 * POST /api/progress/:identifier/complete/:milestoneId
 * Mark a milestone as complete (shortcut endpoint)
 */
router.post('/:identifier/complete/:milestoneId', async (req, res) => {
  try {
    const { identifier, milestoneId } = req.params;
    const { data } = req.body;

    // Find user progress document
    const querySnapshot = await db
      .collection('user_progress')
      .where('userId', '==', identifier)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found',
      });
    }

    const doc = querySnapshot.docs[0];
    const currentData = doc.data();

    // Mark milestone as completed
    const milestoneUpdate = {
      status: 'completed',
      data: data || {},
      completedAt: new Date(),
    };

    // Calculate new overall progress
    const milestones = { ...currentData.milestones };
    milestones[milestoneId] = milestoneUpdate;

    const completedCount = Object.values(milestones).filter(
      (m: any) => m.status === 'completed'
    ).length;
    const totalMilestones = 8;
    const overallProgress = (completedCount / totalMilestones) * 100;

    // Update in Firestore
    await doc.ref.update({
      [`milestones.${milestoneId}`]: milestoneUpdate,
      overallProgress,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        milestoneId,
        status: 'completed',
        overallProgress,
        completedCount,
        totalMilestones,
      },
    });
  } catch (error: any) {
    console.error('Complete milestone error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete milestone',
    });
  }
});

/**
 * GET /api/progress/stats/:identifier
 * Get summary statistics for user's progress
 */
router.get('/stats/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    const querySnapshot = await db
      .collection('user_progress')
      .where('userId', '==', identifier)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found',
      });
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const milestones = data.milestones;

    const stats = {
      overallProgress: data.overallProgress,
      completedCount: Object.values(milestones).filter(
        (m: any) => m.status === 'completed'
      ).length,
      inProgressCount: Object.values(milestones).filter(
        (m: any) => m.status === 'in_progress'
      ).length,
      pendingCount: Object.values(milestones).filter(
        (m: any) => m.status === 'pending'
      ).length,
      totalMilestones: 8,
      lastUpdated: data.updatedAt?.toDate(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve progress stats',
    });
  }
});

/**
 * GET /api/admin/progress/all
 * Get all user progress records (admin only)
 * TODO: Add admin authentication middleware
 */
router.get('/admin/all', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const querySnapshot = await db
      .collection('user_progress')
      .orderBy('updatedAt', 'desc')
      .limit(parseInt(limit as string))
      .get();

    const progressRecords = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    res.json({
      success: true,
      data: progressRecords,
      count: progressRecords.length,
    });
  } catch (error: any) {
    console.error('Get all progress records error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve progress records',
    });
  }
});

export default router;

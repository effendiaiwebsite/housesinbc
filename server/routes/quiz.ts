/**
 * Quiz Routes
 *
 * Handle quiz submissions and retrieve quiz responses
 */

import { Router } from 'express';
import { db } from '../db';
import { quizSchema } from '../../shared/schema';
import { calculateQuizBreakdown } from '../utils/mortgageCalc';
import { calculateTotalIncentives } from '../utils/incentivesCalc';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/quiz/submit
 * Submit quiz response and calculate affordability + incentives
 */
router.post('/submit', async (req, res) => {
  try {
    const { quizData, userId, sessionId } = req.body;

    // Validate quiz data
    const validated = quizSchema.parse(quizData);

    // Calculate affordability breakdown
    const breakdown = calculateQuizBreakdown(
      validated.income,
      validated.savings,
      0.045 // Assumed 4.5% interest rate
    );

    console.log('🧮 Quiz Breakdown Calculated:');
    console.log('  Income:', validated.income);
    console.log('  Savings:', validated.savings);
    console.log('  Breakdown:', breakdown);

    // Determine if property type suggests new home
    const isNewHome = false; // Can be enhanced based on property type

    // Calculate incentives
    const incentives = calculateTotalIncentives(
      breakdown.affordablePrice,
      validated.income,
      isNewHome,
      validated.hasRRSP,
      validated.hasRRSP ? 35000 : 0 // Assumed max RRSP if they have it
    );

    console.log('💰 Incentives Calculated:', incentives);

    // Generate or use existing session ID
    const finalSessionId = sessionId || uuidv4();

    // Save to Firestore
    const dataToSave = {
      ...validated,
      userId: userId || null,
      sessionId: finalSessionId,
      calculatedAffordability: breakdown.affordablePrice,
      calculatedBreakdown: {
        affordablePrice: breakdown.affordablePrice,
        mortgage: breakdown.mortgage,
        downPayment: breakdown.downPayment,
        closingCosts: breakdown.closingCosts,
        buffer: breakdown.buffer,
      },
      calculatedIncentives: {
        ptt: incentives.ptt,
        gst: incentives.gst,
        fhsa: incentives.fhsa,
        total: incentives.total,
      },
      createdAt: new Date(),
    };

    console.log('💾 Saving to Firestore:', JSON.stringify(dataToSave, null, 2));

    const quizResponse = await db.collection('quiz_responses').add(dataToSave);

    // Initialize user progress tracking
    const progressData = {
      userId: userId || finalSessionId,
      quizResponseId: quizResponse.id,
      milestones: {
        step1_creditScore: {
          status: 'pending',
          data: {},
        },
        step2_fhsa: {
          status: 'pending',
          data: {},
        },
        step3_preApproval: {
          status: 'pending',
          data: {},
        },
        step4_incentives: {
          status: 'completed', // Auto-completed from quiz
          data: {
            totalSavings: incentives.total,
          },
          completedAt: new Date(),
        },
        step5_neighborhoods: {
          status: 'pending',
          data: {},
        },
        step6_searchProperties: {
          status: 'pending',
          data: {},
        },
        step7_bookViewing: {
          status: 'pending',
          data: {},
        },
        step8_makeOffer: {
          status: 'pending',
          data: {},
        },
      },
      overallProgress: 12.5, // 1 out of 8 steps complete
      updatedAt: new Date(),
    };

    await db.collection('user_progress').add(progressData);

    res.json({
      success: true,
      data: {
        quizResponseId: quizResponse.id,
        sessionId: finalSessionId,
        breakdown: {
          affordablePrice: breakdown.affordablePrice,
          mortgage: breakdown.mortgage,
          downPayment: breakdown.downPayment,
          closingCosts: breakdown.closingCosts,
          buffer: breakdown.buffer,
        },
        incentives: {
          ptt: incentives.ptt,
          gst: incentives.gst,
          fhsa: incentives.fhsa,
          total: incentives.total,
        },
      },
    });
  } catch (error: any) {
    console.error('Quiz submission error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to submit quiz',
    });
  }
});

/**
 * GET /api/quiz/response/:identifier
 * Get quiz response by userId or sessionId
 */
router.get('/response/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Try to find by userId first, then by sessionId
    // Note: We removed orderBy to avoid requiring a composite index
    let querySnapshot = await db
      .collection('quiz_responses')
      .where('userId', '==', identifier)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      querySnapshot = await db
        .collection('quiz_responses')
        .where('sessionId', '==', identifier)
        .limit(1)
        .get();
    }

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Quiz response not found',
      });
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    // If calculatedBreakdown is missing (old quiz response), recalculate it
    if (!data.calculatedBreakdown && data.income && data.savings) {
      console.log('⚠️  Old quiz response found, recalculating breakdown...');
      const breakdown = calculateQuizBreakdown(
        data.income,
        data.savings,
        0.045
      );
      data.calculatedBreakdown = {
        affordablePrice: breakdown.affordablePrice,
        mortgage: breakdown.mortgage,
        downPayment: breakdown.downPayment,
        closingCosts: breakdown.closingCosts,
        buffer: breakdown.buffer,
      };

      // Also recalculate incentives if missing
      if (!data.calculatedIncentives) {
        const incentives = calculateTotalIncentives(
          breakdown.affordablePrice,
          data.income,
          false,
          data.hasRRSP || false,
          data.hasRRSP ? 35000 : 0
        );
        data.calculatedIncentives = {
          ptt: incentives.ptt,
          gst: incentives.gst,
          fhsa: incentives.fhsa,
          total: incentives.total,
        };
      }
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      },
    });
  } catch (error: any) {
    console.error('Get quiz response error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve quiz response',
    });
  }
});

/**
 * PUT /api/quiz/response/:id
 * Update existing quiz response (for recalculations)
 */
router.put('/response/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quizData } = req.body;

    // Validate quiz data
    const validated = quizSchema.parse(quizData);

    // Recalculate
    const breakdown = calculateQuizBreakdown(
      validated.income,
      validated.savings,
      0.045
    );

    const incentives = calculateTotalIncentives(
      breakdown.affordablePrice,
      validated.income,
      false,
      validated.hasRRSP,
      validated.hasRRSP ? 35000 : 0
    );

    // Update in Firestore
    await db.collection('quiz_responses').doc(id).update({
      ...validated,
      calculatedAffordability: breakdown.affordablePrice,
      calculatedBreakdown: {
        affordablePrice: breakdown.affordablePrice,
        mortgage: breakdown.mortgage,
        downPayment: breakdown.downPayment,
        closingCosts: breakdown.closingCosts,
        buffer: breakdown.buffer,
      },
      calculatedIncentives: {
        ptt: incentives.ptt,
        gst: incentives.gst,
        fhsa: incentives.fhsa,
        total: incentives.total,
      },
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        breakdown: {
          affordablePrice: breakdown.affordablePrice,
          mortgage: breakdown.mortgage,
          downPayment: breakdown.downPayment,
          closingCosts: breakdown.closingCosts,
          buffer: breakdown.buffer,
        },
        incentives: {
          ptt: incentives.ptt,
          gst: incentives.gst,
          fhsa: incentives.fhsa,
          total: incentives.total,
        },
      },
    });
  } catch (error: any) {
    console.error('Update quiz response error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update quiz response',
    });
  }
});

/**
 * GET /api/admin/quiz/all
 * Get all quiz responses (admin only)
 * TODO: Add admin authentication middleware
 */
router.get('/admin/all', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const querySnapshot = await db
      .collection('quiz_responses')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .get();

    const quizResponses = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    res.json({
      success: true,
      data: quizResponses,
      count: quizResponses.length,
    });
  } catch (error: any) {
    console.error('Get all quiz responses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve quiz responses',
    });
  }
});

export default router;

/**
 * Mortgage Rates Routes
 *
 * Handle mortgage rate fetching, caching, and personalization
 */

import { Router } from 'express';
import { db } from '../db';
import { personalizeRatesRequestSchema } from '../../shared/schema';
import {
  calculateMonthlyPayment,
  getStressTestRate,
  personalizeRate,
  determineApprovalOdds,
} from '../utils/mortgageCalc';

const router = Router();

/**
 * Fallback rates if API is unavailable
 * These should be updated regularly or fetched from an API
 */
const getFallbackRates = () => {
  // Generate rates for multiple terms (1-10 years)
  // Rates generally decrease with shorter terms
  const lenders = [
    { name: 'TD Bank', type: 'fixed' as const, baseRate: 0.0374 },
    { name: 'RBC', type: 'fixed' as const, baseRate: 0.0379 },
    { name: 'Scotiabank', type: 'fixed' as const, baseRate: 0.0384 },
    { name: 'BMO', type: 'fixed' as const, baseRate: 0.0369 },
    { name: 'CIBC', type: 'fixed' as const, baseRate: 0.0389 },
    { name: 'MCAP', type: 'variable' as const, baseRate: 0.0345 },
    { name: 'Vancity', type: 'fixed' as const, baseRate: 0.0369 },
    { name: 'Coast Capital', type: 'fixed' as const, baseRate: 0.0379 },
    { name: 'Tangerine', type: 'fixed' as const, baseRate: 0.0399 },
    { name: 'First National', type: 'variable' as const, baseRate: 0.0350 },
  ];

  const rates = [];

  // Generate rates for terms 1-10 years
  for (let term = 1; term <= 10; term++) {
    // Rate adjustment based on term
    // Shorter terms get lower rates, longer terms get higher rates
    let termAdjustment = 0;
    if (term === 1) termAdjustment = -0.0020; // 1 year: -0.20%
    else if (term === 2) termAdjustment = -0.0015; // 2 year: -0.15%
    else if (term === 3) termAdjustment = -0.0010; // 3 year: -0.10%
    else if (term === 4) termAdjustment = -0.0005; // 4 year: -0.05%
    else if (term === 5) termAdjustment = 0.0000; // 5 year: base rate
    else if (term === 6) termAdjustment = 0.0003; // 6 year: +0.03%
    else if (term === 7) termAdjustment = 0.0005; // 7 year: +0.05%
    else if (term === 8) termAdjustment = 0.0008; // 8 year: +0.08%
    else if (term === 9) termAdjustment = 0.0010; // 9 year: +0.10%
    else if (term === 10) termAdjustment = 0.0012; // 10 year: +0.12%

    for (const lender of lenders) {
      rates.push({
        lender: lender.name,
        type: lender.type,
        term,
        rate: lender.baseRate + termAdjustment,
        province: 'BC',
      });
    }
  }

  return rates;
};

/**
 * GET /api/rates/current
 * Get current cached mortgage rates
 */
router.get('/current', async (req, res) => {
  try {
    const { province = 'BC', term = 5 } = req.query;

    // Try to get from cache
    const cacheSnapshot = await db
      .collection('mortgage_rates_cache')
      .where('province', '==', province)
      .where('expiresAt', '>', new Date())
      .orderBy('expiresAt', 'desc')
      .limit(1)
      .get();

    let rates;

    if (!cacheSnapshot.empty) {
      // Use cached rates
      const cacheDoc = cacheSnapshot.docs[0];
      const cacheData = cacheDoc.data();
      rates = cacheData.rates;
    } else {
      // Use fallback rates and cache them
      rates = getFallbackRates();

      // Cache for 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await db.collection('mortgage_rates_cache').add({
        province,
        rates,
        cachedAt: new Date(),
        expiresAt,
      });
    }

    // Filter by term if specified
    const filteredRates = term
      ? rates.filter((r: any) => r.term === parseInt(term as string))
      : rates;

    res.json({
      success: true,
      data: filteredRates,
      cached: !cacheSnapshot.empty,
    });
  } catch (error: any) {
    console.error('Get rates error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve rates',
    });
  }
});

/**
 * POST /api/rates/personalize
 * Calculate personalized rates based on user profile
 */
router.post('/personalize', async (req, res) => {
  try {
    const validated = personalizeRatesRequestSchema.parse(req.body);

    const {
      income,
      creditScore,
      downPaymentPercent,
      amortizationYears,
      term,
      loanAmount,
    } = validated;

    // Get current rates
    const ratesSnapshot = await db
      .collection('mortgage_rates_cache')
      .where('province', '==', 'BC')
      .where('expiresAt', '>', new Date())
      .orderBy('expiresAt', 'desc')
      .limit(1)
      .get();

    let baseRates;

    if (!ratesSnapshot.empty) {
      const ratesDoc = ratesSnapshot.docs[0];
      baseRates = ratesDoc.data().rates;
    } else {
      baseRates = getFallbackRates();
    }

    // Filter by term
    const termRates = baseRates.filter((r: any) => r.term === term);

    // Personalize each rate
    const personalizedRates = termRates.map((rate: any) => {
      const adjustedRate = personalizeRate(
        rate.rate,
        creditScore,
        downPaymentPercent,
        true // isFirstTimeBuyer
      );

      const stressRate = getStressTestRate(adjustedRate);

      // Calculate monthly payments
      const calculatedLoanAmount = loanAmount || income * 4.5; // Estimate if not provided
      const monthly = calculateMonthlyPayment(
        calculatedLoanAmount,
        adjustedRate,
        amortizationYears
      );
      const stressMonthly = calculateMonthlyPayment(
        calculatedLoanAmount,
        stressRate,
        amortizationYears
      );

      // Determine approval odds
      const approvalOdds = determineApprovalOdds(
        creditScore,
        income,
        calculatedLoanAmount
      );

      return {
        lender: rate.lender,
        type: rate.type,
        term: rate.term,
        advertisedRate: rate.rate,
        personalizedRate: adjustedRate,
        monthlyPayment: Math.round(monthly),
        stressTestPayment: Math.round(stressMonthly),
        approvalOdds,
      };
    });

    // Sort by personalized rate (best first)
    personalizedRates.sort((a: any, b: any) => a.personalizedRate - b.personalizedRate);

    res.json({
      success: true,
      data: {
        rates: personalizedRates,
        calculatedLoanAmount: loanAmount || income * 4.5,
      },
    });
  } catch (error: any) {
    console.error('Personalize rates error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to personalize rates',
    });
  }
});

/**
 * POST /api/rates/refresh
 * Force refresh rates from API (admin only)
 * TODO: Add authentication middleware to restrict to admin
 */
router.post('/refresh', async (_req, res) => {
  try {
    // In the future, this would call an external API
    // For now, just update the cache with fallback rates

    const rates = getFallbackRates();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.collection('mortgage_rates_cache').add({
      province: 'BC',
      rates,
      cachedAt: new Date(),
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Rates refreshed successfully',
      data: rates,
    });
  } catch (error: any) {
    console.error('Refresh rates error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh rates',
    });
  }
});

/**
 * GET /api/rates/compare
 * Get quick rate comparison for common scenarios
 */
router.get('/compare', async (_req, res) => {
  try {
    const scenarios = [
      {
        name: 'Excellent Credit (740+)',
        creditScore: 750,
        downPayment: 20,
      },
      {
        name: 'Good Credit (680-739)',
        creditScore: 700,
        downPayment: 15,
      },
      {
        name: 'Fair Credit (620-679)',
        creditScore: 650,
        downPayment: 10,
      },
    ];

    const baseRates = getFallbackRates().filter((r) => r.term === 5);

    const comparisons = scenarios.map((scenario) => {
      const rateEstimates = baseRates.slice(0, 3).map((rate: any) => {
        const adjustedRate = personalizeRate(
          rate.rate,
          scenario.creditScore,
          scenario.downPayment,
          true
        );

        return {
          lender: rate.lender,
          advertisedRate: rate.rate,
          estimatedRate: adjustedRate,
          savings: ((rate.rate - adjustedRate) * 100).toFixed(2) + '%',
        };
      });

      return {
        scenario: scenario.name,
        creditScore: scenario.creditScore,
        downPayment: scenario.downPayment + '%',
        rates: rateEstimates,
      };
    });

    res.json({
      success: true,
      data: comparisons,
    });
  } catch (error: any) {
    console.error('Compare rates error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare rates',
    });
  }
});

export default router;

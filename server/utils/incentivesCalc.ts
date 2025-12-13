/**
 * BC Government Incentives Calculation Utilities
 *
 * Calculate savings from various BC and federal first-time home buyer programs
 * Based on 2025 BC government rules and regulations
 */

/**
 * Calculate BC Property Transfer Tax (PTT) savings for first-time buyers
 *
 * Full exemption up to $500,000
 * Partial exemption from $500,000 to $835,000
 * No exemption above $835,000 (phased out at $860,000 for new homes)
 *
 * Regular PTT rates (without exemption):
 * - 1% on first $200,000
 * - 2% from $200,000 to $2,000,000
 * - 3% from $2,000,000 to $3,000,000
 * - 5% above $3,000,000
 *
 * @param homePrice - Property purchase price
 * @param isFirstTimeBuyer - Whether buyer qualifies as first-time buyer
 * @returns PTT savings amount
 */
export function calculatePTTSavings(
  homePrice: number,
  isFirstTimeBuyer: boolean = true
): number {
  if (!isFirstTimeBuyer) {
    return 0; // No exemption for non-first-time buyers
  }

  // Calculate what the PTT would be without exemption
  let fullPTT = 0;

  if (homePrice <= 200000) {
    fullPTT = homePrice * 0.01;
  } else if (homePrice <= 2000000) {
    fullPTT = 200000 * 0.01 + (homePrice - 200000) * 0.02;
  } else if (homePrice <= 3000000) {
    fullPTT = 200000 * 0.01 + 1800000 * 0.02 + (homePrice - 2000000) * 0.03;
  } else {
    fullPTT = 200000 * 0.01 + 1800000 * 0.02 + 1000000 * 0.03 + (homePrice - 3000000) * 0.05;
  }

  // Apply first-time buyer exemption
  if (homePrice <= 500000) {
    // Full exemption
    return fullPTT;
  } else if (homePrice <= 835000) {
    // Partial exemption (phases out linearly)
    const excessAmount = homePrice - 500000;
    const phaseOutRatio = excessAmount / 335000; // (835000 - 500000)

    // Calculate PTT on the first $500K (this is fully exempt)
    const pttOnFirst500K = 200000 * 0.01 + 300000 * 0.02;

    // Calculate PTT on amount above $500K (partially exempt)
    const pttOnExcess = excessAmount * 0.02;

    // Exemption amount decreases as price increases
    const exemptionAmount = pttOnFirst500K + (pttOnExcess * (1 - phaseOutRatio));

    return Math.round(exemptionAmount);
  } else {
    // No exemption for homes above $835,000
    return 0;
  }
}

/**
 * Calculate BC PTT exemption for newly built homes (expanded in 2024)
 *
 * Full exemption for new homes up to $1.1M
 * Partial exemption from $1.1M to $1.15M
 *
 * @param homePrice - Property purchase price
 * @param isNewHome - Whether property is newly constructed
 * @param isFirstTimeBuyer - Whether buyer is first-time buyer
 * @returns PTT savings for new home
 */
export function calculateNewHomePTTSavings(
  homePrice: number,
  isNewHome: boolean,
  isFirstTimeBuyer: boolean = true
): number {
  if (!isNewHome || !isFirstTimeBuyer) {
    return 0;
  }

  // Calculate full PTT
  let fullPTT = 0;
  if (homePrice <= 200000) {
    fullPTT = homePrice * 0.01;
  } else if (homePrice <= 2000000) {
    fullPTT = 200000 * 0.01 + (homePrice - 200000) * 0.02;
  } else {
    fullPTT = 200000 * 0.01 + 1800000 * 0.02 + (homePrice - 2000000) * 0.03;
  }

  if (homePrice <= 1100000) {
    // Full exemption
    return fullPTT;
  } else if (homePrice <= 1150000) {
    // Partial exemption (phases out over $50K range)
    const excessAmount = homePrice - 1100000;
    const phaseOutRatio = excessAmount / 50000;

    const pttOnFirst1_1M = 200000 * 0.01 + 900000 * 0.02;
    const pttOnExcess = excessAmount * 0.02;

    const exemptionAmount = pttOnFirst1_1M + (pttOnExcess * (1 - phaseOutRatio));
    return Math.round(exemptionAmount);
  }

  return 0;
}

/**
 * Calculate federal GST/HST New Housing Rebate
 *
 * Up to 36% rebate on GST for new homes
 * Full rebate for homes up to $350,000
 * Partial rebate from $350,000 to $450,000
 * Expanded for first-time buyers in 2025 up to $1M (phased to $1.5M)
 *
 * @param homePrice - Purchase price of new home
 * @param isNewHome - Whether property is newly constructed
 * @param isFirstTimeBuyer - Whether buyer is first-time buyer
 * @returns GST rebate amount
 */
export function calculateGSTRebate(
  homePrice: number,
  isNewHome: boolean,
  isFirstTimeBuyer: boolean = true
): number {
  if (!isNewHome) {
    return 0; // Only for new homes
  }

  // GST in BC is 5%
  const gstAmount = homePrice * 0.05;

  // Standard rebate (36% of GST)
  const standardRebateRate = 0.36;

  if (homePrice <= 350000) {
    // Full rebate (36% of GST)
    return gstAmount * standardRebateRate;
  } else if (homePrice <= 450000) {
    // Partial rebate (phases out linearly)
    const phaseOutRatio = (homePrice - 350000) / 100000;
    return gstAmount * standardRebateRate * (1 - phaseOutRatio);
  } else if (isFirstTimeBuyer && homePrice <= 1000000) {
    // Enhanced rebate for first-time buyers (2025 expansion)
    // Full GST exemption for first-time buyers up to $1M
    return gstAmount;
  } else if (isFirstTimeBuyer && homePrice <= 1500000) {
    // Partial exemption from $1M to $1.5M
    const phaseOutRatio = (homePrice - 1000000) / 500000;
    return gstAmount * (1 - phaseOutRatio);
  }

  return 0;
}

/**
 * Calculate FHSA (First Home Savings Account) tax benefit
 *
 * Contributions are tax-deductible (up to $8,000/year, $40,000 lifetime)
 * Withdrawals are tax-free for first home purchase
 *
 * @param income - Annual income (to determine marginal tax rate)
 * @param contribution - Annual FHSA contribution (max $8,000)
 * @returns Tax savings from FHSA contribution
 */
export function calculateFHSABenefit(
  income: number,
  contribution: number = 8000
): number {
  // Cap contribution at annual limit
  const actualContribution = Math.min(contribution, 8000);

  // Estimate BC + federal marginal tax rate based on income
  let marginalTaxRate = 0;

  if (income <= 47937) {
    marginalTaxRate = 0.2006; // 20.06% (BC 5.06% + Federal 15%)
  } else if (income <= 95875) {
    marginalTaxRate = 0.2770; // 27.70% (BC 7.70% + Federal 20%)
  } else if (income <= 110076) {
    marginalTaxRate = 0.3116; // 31.16% (BC 10.50% + Federal 20.64%)
  } else if (income <= 148537) {
    marginalTaxRate = 0.3287; // 32.87% (BC 12.29% + Federal 20.58%)
  } else if (income <= 227091) {
    marginalTaxRate = 0.3816; // 38.16% (BC 14.70% + Federal 23.46%)
  } else {
    marginalTaxRate = 0.4910; // 49.10% (BC 16.80% + Federal 32.30%)
  }

  // Tax deduction benefit
  return actualContribution * marginalTaxRate;
}

/**
 * Calculate Home Buyers' Plan (HBP) RRSP withdrawal benefit
 *
 * Withdraw up to $35,000 tax-free from RRSP
 * Must be repaid over 15 years
 *
 * @param rrspBalance - Current RRSP balance
 * @param withdrawalAmount - Amount to withdraw (max $35,000)
 * @returns Details about HBP benefit
 */
export function calculateHBPBenefit(
  rrspBalance: number,
  withdrawalAmount: number = 35000
): {
  availableWithdrawal: number;
  annualRepayment: number;
  benefit: number;
} {
  const maxWithdrawal = 35000;
  const availableWithdrawal = Math.min(
    withdrawalAmount,
    maxWithdrawal,
    rrspBalance
  );

  // Repayment period is 15 years, starting 2 years after withdrawal
  const annualRepayment = availableWithdrawal / 15;

  // Benefit is the interest-free use of the funds
  // Assuming 5% opportunity cost over 2 years before repayment starts
  const benefit = availableWithdrawal * 0.05 * 2;

  return {
    availableWithdrawal: Math.round(availableWithdrawal),
    annualRepayment: Math.round(annualRepayment),
    benefit: Math.round(benefit),
  };
}

/**
 * Calculate BC Home Owner Grant
 *
 * Annual property tax reduction
 * Up to $570 for homes assessed under $2.175M
 * Additional $275 for seniors or veterans
 *
 * @param assessedValue - Property assessed value
 * @param isSenior - Whether homeowner is 65+ or veteran
 * @returns Annual grant amount
 */
export function calculateHomeOwnerGrant(
  assessedValue: number,
  isSenior: boolean = false
): number {
  if (assessedValue > 2175000) {
    return 0; // No grant for high-value homes
  }

  let baseGrant = 570;

  if (isSenior) {
    baseGrant += 275; // Additional grant for seniors/veterans
  }

  return baseGrant;
}

/**
 * Calculate total first-year incentives for quiz pie chart
 *
 * @param homePrice - Property purchase price
 * @param income - Annual household income
 * @param isNewHome - Whether property is newly constructed
 * @param hasRRSP - Whether buyer has RRSP funds
 * @param rrspBalance - RRSP balance if applicable
 * @returns Breakdown of all available incentives
 */
export function calculateTotalIncentives(
  homePrice: number,
  income: number,
  isNewHome: boolean = false,
  hasRRSP: boolean = false,
  rrspBalance: number = 0
): {
  ptt: number;
  gst: number;
  fhsa: number;
  hbp: number;
  homeOwnerGrant: number;
  total: number;
} {
  // Use enhanced new home PTT if applicable, otherwise standard
  const ptt = isNewHome
    ? calculateNewHomePTTSavings(homePrice, isNewHome, true)
    : calculatePTTSavings(homePrice, true);

  const gst = calculateGSTRebate(homePrice, isNewHome, true);

  const fhsa = calculateFHSABenefit(income);

  const hbp = hasRRSP
    ? calculateHBPBenefit(rrspBalance).benefit
    : 0;

  const homeOwnerGrant = calculateHomeOwnerGrant(homePrice);

  const total = ptt + gst + fhsa + hbp + homeOwnerGrant;

  return {
    ptt: Math.round(ptt),
    gst: Math.round(gst),
    fhsa: Math.round(fhsa),
    hbp: Math.round(hbp),
    homeOwnerGrant: Math.round(homeOwnerGrant),
    total: Math.round(total),
  };
}

/**
 * Check eligibility for first-time buyer programs
 *
 * @param hasOwnedHome - Whether buyer has previously owned a home
 * @param isCanadianCitizen - Whether buyer is Canadian citizen or PR
 * @param willOccupyAsResidence - Whether property will be principal residence
 * @param bcResidentYears - Years as BC resident (need 1+ for PTT exemption)
 * @returns Eligibility status
 */
export function checkFirstTimeBuyerEligibility(
  hasOwnedHome: boolean,
  isCanadianCitizen: boolean,
  willOccupyAsResidence: boolean,
  bcResidentYears: number
): {
  eligible: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (hasOwnedHome) {
    reasons.push('Must not have previously owned a principal residence anywhere in the world');
  }

  if (!isCanadianCitizen) {
    reasons.push('Must be a Canadian citizen or permanent resident');
  }

  if (!willOccupyAsResidence) {
    reasons.push('Property must be your principal residence');
  }

  if (bcResidentYears < 1) {
    reasons.push('Must be a BC resident for at least 12 months (or filed 2 of last 6 years of taxes in BC)');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

/**
 * Generate incentives summary text for UI display
 *
 * @param incentives - Calculated incentives object
 * @returns User-friendly summary
 */
export function generateIncentivesSummary(incentives: {
  ptt: number;
  gst: number;
  fhsa: number;
  hbp: number;
  homeOwnerGrant: number;
  total: number;
}): string[] {
  const summary: string[] = [];

  if (incentives.ptt > 0) {
    summary.push(`BC Property Transfer Tax Exemption: $${incentives.ptt.toLocaleString()}`);
  }

  if (incentives.gst > 0) {
    summary.push(`GST/HST New Housing Rebate: $${incentives.gst.toLocaleString()}`);
  }

  if (incentives.fhsa > 0) {
    summary.push(`FHSA Tax Deduction (first year): $${incentives.fhsa.toLocaleString()}`);
  }

  if (incentives.hbp > 0) {
    summary.push(`Home Buyers' Plan Benefit: $${incentives.hbp.toLocaleString()}`);
  }

  if (incentives.homeOwnerGrant > 0) {
    summary.push(`BC Home Owner Grant (annual): $${incentives.homeOwnerGrant.toLocaleString()}`);
  }

  summary.push(`\n**Total First-Year Savings: $${incentives.total.toLocaleString()}**`);

  return summary;
}

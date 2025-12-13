/**
 * Mortgage Calculation Utilities
 *
 * Core functions for calculating mortgage payments, stress tests,
 * affordability, and rate personalization based on user profiles.
 */

/**
 * Calculate monthly mortgage payment using PMT formula
 * PMT = P × [r(1+r)^n] / [(1+r)^n – 1]
 *
 * @param principal - Loan amount (home price - down payment)
 * @param annualRate - Annual interest rate (as decimal, e.g., 0.0374 for 3.74%)
 * @param amortizationYears - Loan term in years (typically 25-30)
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (principal <= 0 || annualRate < 0 || amortizationYears <= 0) {
    throw new Error('Invalid input: principal, rate, and amortization must be positive');
  }

  // Handle edge case of 0% interest rate
  if (annualRate === 0) {
    return principal / (amortizationYears * 12);
  }

  const monthlyRate = annualRate / 12;
  const numberOfPayments = amortizationYears * 12;

  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

  return principal * (numerator / denominator);
}

/**
 * Apply Canadian mortgage stress test
 * Required to qualify at higher rate: the greater of (contract rate + 2%) or 5.25%
 *
 * @param actualRate - The actual mortgage rate being offered
 * @returns Stress test qualifying rate
 */
export function getStressTestRate(actualRate: number): number {
  const STRESS_TEST_FLOOR = 0.0525; // 5.25%
  return Math.max(actualRate + 0.02, STRESS_TEST_FLOOR);
}

/**
 * Calculate total interest paid over the life of the mortgage
 *
 * @param monthlyPayment - Monthly payment amount
 * @param principal - Original loan amount
 * @param amortizationYears - Loan term in years
 * @returns Total interest paid
 */
export function calculateTotalInterest(
  monthlyPayment: number,
  principal: number,
  amortizationYears: number
): number {
  const totalPaid = monthlyPayment * amortizationYears * 12;
  return totalPaid - principal;
}

/**
 * Calculate maximum affordable home price based on income and DTI ratio
 * Uses gross debt service (GDS) and total debt service (TDS) ratios
 *
 * @param annualIncome - Gross annual household income
 * @param downPayment - Amount available for down payment
 * @param monthlyDebts - Existing monthly debt obligations
 * @param interestRate - Expected mortgage interest rate
 * @param amortizationYears - Loan term in years
 * @param maxGDS - Maximum gross debt service ratio (default 0.32)
 * @param maxTDS - Maximum total debt service ratio (default 0.40)
 * @returns Calculated affordability details
 */
export function calculateAffordability(
  annualIncome: number,
  downPayment: number,
  monthlyDebts: number = 0,
  interestRate: number = 0.05,
  amortizationYears: number = 25,
  maxGDS: number = 0.32,
  maxTDS: number = 0.40
): {
  maxHomePrice: number;
  maxLoan: number;
  maxMonthlyPayment: number;
  estimatedPropertyTax: number;
  estimatedHeating: number;
} {
  const monthlyIncome = annualIncome / 12;

  // Estimate property tax and heating (typically 1% of home value annually, plus $200/month heating)
  // We'll solve for home price iteratively or use approximation

  // GDS: (Mortgage + Property Tax + Heating) / Monthly Income <= 0.32
  // TDS: (Mortgage + Property Tax + Heating + Other Debts) / Monthly Income <= 0.40

  // Simplified calculation using TDS since it's more restrictive with debts
  const maxHousingPayment = Math.min(
    monthlyIncome * maxGDS, // GDS limit
    (monthlyIncome * maxTDS) - monthlyDebts // TDS limit
  );

  // Estimate: Housing payment = Mortgage (80%) + Property Tax (15%) + Heating (5%)
  const maxMortgagePayment = maxHousingPayment * 0.80;
  const estimatedPropertyTax = maxHousingPayment * 0.15;
  const estimatedHeating = maxHousingPayment * 0.05;

  // Calculate maximum loan amount based on monthly payment
  // Rearrange PMT formula to solve for P (principal)
  const monthlyRate = interestRate / 12;
  const numberOfPayments = amortizationYears * 12;

  const maxLoan = maxMortgagePayment *
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

  const maxHomePrice = maxLoan + downPayment;

  return {
    maxHomePrice: Math.floor(maxHomePrice),
    maxLoan: Math.floor(maxLoan),
    maxMonthlyPayment: Math.round(maxMortgagePayment),
    estimatedPropertyTax: Math.round(estimatedPropertyTax),
    estimatedHeating: Math.round(estimatedHeating),
  };
}

/**
 * Personalize mortgage rate based on user's credit profile
 * Adjustments based on typical lender pricing
 *
 * @param baseRate - Advertised rate from lender
 * @param creditScore - User's credit score (300-900)
 * @param downPaymentPercent - Down payment as percentage of home price
 * @param isFirstTimeBuyer - Whether user is first-time buyer
 * @returns Personalized rate estimate
 */
export function personalizeRate(
  baseRate: number,
  creditScore: number,
  downPaymentPercent: number,
  isFirstTimeBuyer: boolean = true
): number {
  let adjustedRate = baseRate;

  // Credit score adjustment (most significant factor)
  if (creditScore >= 740) {
    adjustedRate -= 0.0025; // Excellent credit: -0.25%
  } else if (creditScore >= 680) {
    adjustedRate -= 0.0010; // Good credit: -0.10%
  } else if (creditScore >= 620) {
    adjustedRate += 0.0010; // Fair credit: +0.10%
  } else if (creditScore >= 600) {
    adjustedRate += 0.0025; // Poor credit: +0.25%
  } else {
    adjustedRate += 0.0050; // Very poor credit: +0.50%
  }

  // Down payment adjustment
  // Less than 20% requires CMHC insurance, but can sometimes get better rates
  if (downPaymentPercent < 20) {
    adjustedRate += 0.0010; // Insured mortgage: +0.10%
  } else if (downPaymentPercent >= 35) {
    adjustedRate -= 0.0005; // Large down payment: -0.05%
  }

  // First-time buyer programs (some lenders offer slight discounts)
  if (isFirstTimeBuyer) {
    adjustedRate -= 0.0005; // First-time buyer discount: -0.05%
  }

  // Floor rate (lenders won't go below certain threshold)
  const RATE_FLOOR = 0.025; // 2.5%
  return Math.max(adjustedRate, RATE_FLOOR);
}

/**
 * Determine approval odds based on credit score, income, and loan amount
 *
 * @param creditScore - User's credit score
 * @param annualIncome - Gross annual income
 * @param loanAmount - Requested loan amount
 * @param monthlyDebts - Existing monthly debts
 * @returns Approval likelihood: 'high', 'medium', or 'low'
 */
export function determineApprovalOdds(
  creditScore: number,
  annualIncome: number,
  loanAmount: number,
  monthlyDebts: number = 0
): 'high' | 'medium' | 'low' {
  // Calculate debt-to-income ratio (approximation)
  const estimatedMonthlyPayment = calculateMonthlyPayment(loanAmount, 0.05, 25);
  const totalMonthlyDebt = estimatedMonthlyPayment + monthlyDebts;
  const dti = (totalMonthlyDebt * 12) / annualIncome;

  // High approval odds criteria
  if (creditScore >= 680 && dti < 0.36 && loanAmount <= annualIncome * 5) {
    return 'high';
  }

  // Low approval odds criteria
  if (creditScore < 620 || dti > 0.43 || loanAmount > annualIncome * 6) {
    return 'low';
  }

  // Medium approval odds (everything else)
  return 'medium';
}

/**
 * Calculate CMHC insurance premium for high-ratio mortgages (< 20% down)
 *
 * @param loanAmount - Mortgage amount
 * @param homePrice - Property purchase price
 * @returns CMHC insurance premium
 */
export function calculateCMHCPremium(
  loanAmount: number,
  homePrice: number
): number {
  const loanToValue = (loanAmount / homePrice) * 100;

  // CMHC premium rates (as of 2025)
  let premiumRate = 0;

  if (loanToValue > 95) {
    premiumRate = 0.04; // 4.00%
  } else if (loanToValue > 90) {
    premiumRate = 0.031; // 3.10%
  } else if (loanToValue > 85) {
    premiumRate = 0.028; // 2.80%
  } else if (loanToValue > 80) {
    premiumRate = 0.024; // 2.40%
  } else {
    return 0; // No CMHC insurance needed for 20%+ down payment
  }

  return loanAmount * premiumRate;
}

/**
 * Calculate total closing costs for a home purchase in BC
 *
 * @param homePrice - Property purchase price
 * @param downPaymentPercent - Down payment percentage
 * @param isFirstTimeBuyer - Whether buyer is first-time buyer (affects PTT)
 * @returns Breakdown of closing costs
 */
export function calculateClosingCosts(
  homePrice: number,
  downPaymentPercent: number,
  _isFirstTimeBuyer: boolean = true
): {
  propertyTransferTax: number;
  legalFees: number;
  homeinspection: number;
  appraisalFee: number;
  cmhcPremium: number;
  totalClosingCosts: number;
} {
  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;

  // Property Transfer Tax (will be calculated in incentives file, using 0 for first-time buyers)
  const propertyTransferTax = 0; // Exempt for first-time buyers up to $835K

  // Legal fees
  const legalFees = 1500; // Typical range: $1,000-$2,000

  // Home inspection
  const homeinspection = 600; // Typical range: $400-$800

  // Appraisal fee (if required by lender)
  const appraisalFee = downPaymentPercent < 20 ? 300 : 0;

  // CMHC insurance premium (if less than 20% down)
  const cmhcPremium = downPaymentPercent < 20
    ? calculateCMHCPremium(loanAmount, homePrice)
    : 0;

  const totalClosingCosts =
    propertyTransferTax +
    legalFees +
    homeinspection +
    appraisalFee +
    cmhcPremium;

  return {
    propertyTransferTax,
    legalFees,
    homeinspection,
    appraisalFee,
    cmhcPremium,
    totalClosingCosts: Math.round(totalClosingCosts),
  };
}

/**
 * Calculate breakdown for quiz pie chart
 *
 * @param income - Annual household income
 * @param savings - Available down payment + emergency fund
 * @param interestRate - Expected mortgage rate
 * @returns Financial breakdown for pie chart display
 */
export function calculateQuizBreakdown(
  income: number,
  savings: number,
  interestRate: number = 0.045,
  _isFirstTimeBuyer: boolean = true
): {
  affordablePrice: number;
  mortgage: number;
  downPayment: number;
  closingCosts: number;
  buffer: number;
} {
  // Use 80% of savings for down payment, 20% for buffer
  const downPayment = savings * 0.80;
  const buffer = savings * 0.20;

  // Calculate affordability based on income
  const affordability = calculateAffordability(
    income,
    downPayment,
    0, // No existing debts assumed
    interestRate,
    25
  );

  // Use income-based affordability as the primary factor
  // Only apply down payment constraint if savings are extremely low (< 5% down)
  let affordablePrice = affordability.maxHomePrice;

  // Ensure minimum 5% down payment requirement
  const minDownPaymentPercent = 0.05;
  const maxPriceWithAvailableDown = downPayment / minDownPaymentPercent;

  // Cap at what can be purchased with available down payment (5% minimum)
  if (downPayment > 0 && maxPriceWithAvailableDown < affordablePrice) {
    affordablePrice = maxPriceWithAvailableDown;
  }

  // Calculate closing costs (simplified)
  const closingCosts = affordablePrice * 0.03; // Approximately 3% of home price

  const mortgage = affordablePrice - downPayment;

  return {
    affordablePrice: Math.floor(affordablePrice),
    mortgage: Math.floor(mortgage),
    downPayment: Math.floor(downPayment),
    closingCosts: Math.floor(closingCosts),
    buffer: Math.floor(buffer),
  };
}

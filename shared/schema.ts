/**
 * Shared Schema and Type Definitions
 *
 * Zod schemas for validation on both client and server.
 * TypeScript types derived from schemas for type safety.
 */

import { z } from 'zod';

// ===== Authentication Schemas =====

export const sendOTPSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'),
});

export const verifyOTPSchema = z.object({
  phoneNumber: z.string(),
  code: z.string().length(6, 'Code must be 6 digits'),
  loginType: z.enum(['admin', 'client']).optional().default('client'),
});

// ===== Lead Capture Schemas =====

export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  source: z.enum(['landing', 'mortgage', 'incentives', 'pricing', 'blog', 'properties', 'calculator', 'guide']),
  email: z.string().email('Invalid email address').optional(),
  metadata: z.record(z.any()).optional(), // Additional data like calculator values, viewed property, etc.
});

// ===== Newsletter Schema =====

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  source: z.string().default('website'),
});

// ===== Webinar Signup Schema =====

export const webinarSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  webinarDate: z.string(), // ISO date string
});

// ===== Appointment Schema =====

export const appointmentSchema = z.object({
  propertyId: z.string().optional(),
  propertyAddress: z.string().min(5, 'Please provide a property address'),
  date: z.string(), // ISO date string
  time: z.string(), // Time slot (e.g., "10:00 AM")
  clientName: z.string().min(2, 'Name must be at least 2 characters'),
  clientPhone: z.string().min(10, 'Please enter a valid phone number'),
  clientEmail: z.string().email('Please enter a valid email address'),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  adminNotes: z.string().optional(),
});

// ===== Blog Schema =====

export const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().max(200, 'Excerpt must be less than 200 characters').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  published: z.boolean().default(false),
});

// ===== Property Schema =====

export const propertySchema = z.object({
  mlsNumber: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().default('BC'),
  postalCode: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  squareFeet: z.number().positive().optional(),
  propertyType: z.enum(['House', 'Condo', 'Townhouse', 'Land', 'Multi-Family', 'Other']),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  status: z.enum(['active', 'pending', 'sold']).default('active'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// ===== TypeScript Types =====

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type WebinarSignupInput = z.infer<typeof webinarSignupSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;

// ===== Firestore Document Types =====

export interface LeadDocument extends LeadInput {
  id: string;
  createdAt: Date;
}

export interface NewsletterDocument extends NewsletterInput {
  id: string;
  subscribed: boolean;
  createdAt: Date;
}

export interface WebinarSignupDocument extends WebinarSignupInput {
  id: string;
  createdAt: Date;
}

export interface AppointmentDocument extends AppointmentInput {
  id: string;
  userId?: string; // If user is authenticated
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogDocument extends BlogInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyDocument extends PropertyInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTPCodeDocument {
  id: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface UserDocument {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  role: 'admin' | 'client';
  verified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Quiz & Onboarding Schemas =====

export const quizSchema = z.object({
  income: z.number().min(0).max(1000000, 'Income must be between $0 and $1,000,000'),
  savings: z.number().min(0).max(500000, 'Savings must be between $0 and $500,000'),
  hasRRSP: z.boolean(),
  propertyType: z.enum(['condo', 'townhome', 'detached']),
  timeline: z.enum(['1-3', '3-6', '6-12']),
});

export const creditScoreSchema = z.object({
  score: z.number().min(300).max(900, 'Credit score must be between 300 and 900'),
  method: z.enum(['manual', 'api']),
});

export const fhsaDataSchema = z.object({
  opened: z.boolean(),
  provider: z.string().optional(),
  proofUrl: z.string().url().optional(),
});

export const ratePreferenceSchema = z.object({
  lender: z.string(),
  advertisedRate: z.number(),
  personalizedRate: z.number(),
  type: z.enum(['fixed', 'variable']),
  term: z.number().min(1).max(10),
  monthlyPayment: z.number(),
  stressTestPayment: z.number(),
  approvalOdds: z.enum(['high', 'medium', 'low']),
});

// ===== Milestone Progress Schemas =====

export const milestoneStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

export const milestone1Schema = z.object({
  status: milestoneStatusSchema,
  data: z.object({
    score: z.number().optional(),
    method: z.enum(['manual', 'api']).optional(),
  }).optional(),
  completedAt: z.date().optional(),
});

export const milestone2Schema = z.object({
  status: milestoneStatusSchema,
  data: fhsaDataSchema.optional(),
  completedAt: z.date().optional(),
});

export const milestone3Schema = z.object({
  status: milestoneStatusSchema,
  data: z.object({
    ratePreferences: z.array(ratePreferenceSchema).optional(),
    documentsUploaded: z.array(z.string()).optional(),
    approvedAmount: z.number().optional(),
  }).optional(),
  completedAt: z.date().optional(),
});

export const milestone4Schema = z.object({
  status: milestoneStatusSchema.default('completed'),
  data: z.object({
    totalSavings: z.number(),
  }),
  completedAt: z.date(),
});

export const milestone5Schema = z.object({
  status: milestoneStatusSchema,
  data: z.object({
    viewedNeighborhoods: z.array(z.string()).optional(),
  }).optional(),
  completedAt: z.date().optional(),
});

export const milestone6Schema = z.object({
  status: milestoneStatusSchema,
  data: z.object({
    savedCount: z.number().optional(),
  }).optional(),
  completedAt: z.date().optional(),
});

export const milestone7Schema = z.object({
  status: milestoneStatusSchema,
  data: z.object({
    appointmentIds: z.array(z.string()).optional(),
  }).optional(),
  completedAt: z.date().optional(),
});

export const milestone8Schema = z.object({
  status: milestoneStatusSchema,
  data: z.object({
    offerIds: z.array(z.string()).optional(),
  }).optional(),
  completedAt: z.date().optional(),
});

export const userProgressSchema = z.object({
  quizResponseId: z.string(),
  milestones: z.object({
    step1_creditScore: milestone1Schema,
    step2_fhsa: milestone2Schema,
    step3_preApproval: milestone3Schema,
    step4_incentives: milestone4Schema,
    step5_neighborhoods: milestone5Schema,
    step6_searchProperties: milestone6Schema,
    step7_bookViewing: milestone7Schema,
    step8_makeOffer: milestone8Schema,
  }),
  overallProgress: z.number().min(0).max(100),
});

// ===== Offer Schema =====

export const offerSchema = z.object({
  propertyZpid: z.string().optional(),
  propertyAddress: z.string().min(5, 'Property address is required'),
  propertyDetails: z.object({
    price: z.number().positive(),
    beds: z.number().min(0).optional(),
    baths: z.number().min(0).optional(),
  }),
  offerDetails: z.object({
    offerPrice: z.number().positive('Offer price must be positive'),
    subjects: z.array(z.string()).default(['financing', 'inspection']),
    notes: z.string().optional(),
  }),
});

export const updateOfferSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn']),
  adminNotes: z.string().optional(),
});

// ===== Personalized Rate Request Schema =====

export const personalizeRatesRequestSchema = z.object({
  income: z.number().positive(),
  creditScore: z.number().min(300).max(900),
  downPaymentPercent: z.number().min(0).max(100),
  amortizationYears: z.number().min(5).max(30).default(25),
  term: z.number().min(1).max(10).default(5),
  loanAmount: z.number().positive().optional(),
});

// ===== TypeScript Types =====

export type QuizData = z.infer<typeof quizSchema>;
export type CreditScoreData = z.infer<typeof creditScoreSchema>;
export type FHSAData = z.infer<typeof fhsaDataSchema>;
export type RatePreference = z.infer<typeof ratePreferenceSchema>;
export type MilestoneStatus = z.infer<typeof milestoneStatusSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type PersonalizeRatesRequest = z.infer<typeof personalizeRatesRequestSchema>;

// ===== Firestore Document Types =====

export interface QuizResponseDocument extends QuizData {
  id: string;
  userId?: string;
  sessionId: string;
  calculatedAffordability: number;
  calculatedIncentives: {
    ptt: number;
    gst: number;
    fhsa: number;
    total: number;
  };
  createdAt: Date;
}

export interface UserProgressDocument extends UserProgress {
  id: string;
  userId: string;
  updatedAt: Date;
}

export interface OfferDocument extends OfferInput {
  id: string;
  userId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MortgageRate {
  lender: string;
  type: 'fixed' | 'variable';
  term: number;
  rate: number;
  province: string;
  lastUpdated?: Date;
}

export interface MortgageRatesCacheDocument {
  id: string;
  province: string;
  rates: MortgageRate[];
  cachedAt: Date;
  expiresAt: Date;
}

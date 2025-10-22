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

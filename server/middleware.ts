/**
 * Express Middleware
 *
 * Authentication, validation, and utility middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Extend Express Request to include session user data
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    phoneNumber?: string;
    role?: 'admin' | 'client';
    isAuthenticated?: boolean;
  }
}

/**
 * Authentication middleware - Require valid session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAuthenticated) {
    return next();
  }

  return res.status(401).json({
    error: 'Authentication required',
    message: 'Please log in to access this resource',
  });
}

/**
 * Admin-only middleware - Require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAuthenticated && req.session?.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Admin access required',
  });
}

/**
 * Validation middleware factory - Validates request body against Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors || error.message,
      });
    }
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Server error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

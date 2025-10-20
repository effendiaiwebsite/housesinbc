/**
 * Appointments API Routes
 *
 * Endpoints for managing property viewing appointments
 */

import { Router } from 'express';
import { z } from 'zod';
import { collections } from '../db';
import { requireAuth, requireAdmin, validateBody } from '../middleware';

const router = Router();

// Appointment schema for validation
const appointmentSchema = z.object({
  propertyAddress: z.string().min(5, 'Property address is required'),
  preferredDate: z.string().datetime('Invalid date format'),
  preferredTime: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
  clientPhone: z.string().optional(), // For admin creating appointments
  clientName: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  preferredDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
});

/**
 * POST /api/appointments
 * Create a new appointment (client or admin)
 */
router.post('/', requireAuth, validateBody(appointmentSchema), async (req, res) => {
  try {
    const { propertyAddress, preferredDate, preferredTime, notes, clientPhone, clientName } = req.body;
    const userId = req.session.userId;
    const isAdmin = req.session.role === 'admin';

    // If admin is creating for a client, use provided info; otherwise use session user
    const appointmentData = {
      userId: isAdmin && clientPhone ? clientPhone : userId,
      clientName: isAdmin && clientName ? clientName : req.session.userName || 'Unknown',
      clientPhone: isAdmin && clientPhone ? clientPhone : req.session.phoneNumber,
      propertyAddress,
      preferredDate: new Date(preferredDate),
      preferredTime,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await collections.appointments.add(appointmentData);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      id: docRef.id,
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment',
      details: error.message
    });
  }
});

/**
 * GET /api/appointments
 * Get all appointments (admin) or user's appointments (client)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.session.role === 'admin';
    const userId = req.session.userId;

    let query = collections.appointments.orderBy('preferredDate', 'desc');

    // If not admin, filter by userId
    if (!isAdmin) {
      query = collections.appointments
        .where('userId', '==', userId)
        .orderBy('preferredDate', 'desc') as any;
    }

    const snapshot = await query.get();

    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      preferredDate: doc.data().preferredDate?.toDate?.() || doc.data().preferredDate,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments',
      details: error.message
    });
  }
});

/**
 * GET /api/appointments/:id
 * Get a specific appointment
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.session.role === 'admin';
    const userId = req.session.userId;

    const doc = await collections.appointments.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    const data = doc.data();

    // Check if user has access (admin or owner)
    if (!isAdmin && data?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        preferredDate: data?.preferredDate?.toDate?.() || data?.preferredDate,
        createdAt: data?.createdAt?.toDate?.() || data?.createdAt,
        updatedAt: data?.updatedAt?.toDate?.() || data?.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment',
      details: error.message
    });
  }
});

/**
 * PUT /api/appointments/:id
 * Update an appointment (admin or owner can update)
 */
router.put('/:id', requireAuth, validateBody(updateAppointmentSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.session.role === 'admin';
    const userId = req.session.userId;

    const doc = await collections.appointments.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    const data = doc.data();

    // Check if user has access
    if (!isAdmin && data?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updates: any = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Convert date string to Date object if provided
    if (updates.preferredDate) {
      updates.preferredDate = new Date(updates.preferredDate);
    }

    await collections.appointments.doc(id).update(updates);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment',
      details: error.message
    });
  }
});

/**
 * DELETE /api/appointments/:id
 * Delete an appointment (admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await collections.appointments.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    await collections.appointments.doc(id).delete();

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment',
      details: error.message
    });
  }
});

export default router;

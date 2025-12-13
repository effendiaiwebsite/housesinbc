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
// Accepts both mobile format (zpid, dateTime, type) and web format (propertyAddress, preferredDate, preferredTime)
const appointmentSchema = z.object({
  // Mobile app fields
  zpid: z.string().optional(),
  dateTime: z.string().datetime().optional(),
  type: z.enum(['in-person', 'virtual']).optional(),
  // Web app fields (legacy)
  propertyAddress: z.string().optional(),
  preferredDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  // Common fields
  notes: z.string().optional(),
  clientPhone: z.string().optional(),
  clientName: z.string().optional(),
}).refine(
  (data) => {
    // Either mobile format OR web format must be provided
    const hasMobileFormat = data.zpid && data.dateTime;
    const hasWebFormat = data.propertyAddress && data.preferredDate && data.preferredTime;
    return hasMobileFormat || hasWebFormat;
  },
  {
    message: 'Either provide (zpid + dateTime) for mobile or (propertyAddress + preferredDate + preferredTime) for web',
  }
);

const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  preferredDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
});

/**
 * POST /api/appointments
 * Create a new appointment - Auto-registers user if not authenticated
 * Public endpoint that handles both authenticated and unauthenticated users
 */
router.post('/', validateBody(appointmentSchema), async (req, res) => {
  try {
    const { zpid, dateTime, type, notes, clientPhone, clientName, propertyAddress, preferredDate, preferredTime } = req.body;
    const isAuthenticated = req.session?.isAuthenticated;
    const isAdmin = req.session?.role === 'admin';

    // Support both old and new formats
    const finalZpid = zpid;
    const finalDateTime = dateTime || preferredDate;
    const finalType = type || 'in-person';
    const finalPropertyAddress = propertyAddress || `Property ${zpid}`;

    let finalUserId: string;
    let finalClientName: string;
    let finalClientPhone: string;

    // Case 1: Authenticated admin creating for a client
    if (isAuthenticated && isAdmin && clientPhone && clientName) {
      finalClientPhone = clientPhone;
      finalClientName = clientName;

      // Find or create user for the client
      const userSnapshot = await collections.users
        .where('phoneNumber', '==', clientPhone)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        // Auto-register the client
        const newUserRef = await collections.users.add({
          phoneNumber: clientPhone,
          name: clientName,
          role: 'client',
          verified: false, // Not verified via OTP yet
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        finalUserId = newUserRef.id;
      } else {
        finalUserId = userSnapshot.docs[0].id;
        // Update name if provided
        await userSnapshot.docs[0].ref.update({
          name: clientName,
          updatedAt: new Date(),
        });
      }
    }
    // Case 2: Authenticated client booking for themselves
    else if (isAuthenticated && !isAdmin) {
      finalUserId = req.session.userId!;
      finalClientName = req.session.userName || clientName || 'Unknown';
      finalClientPhone = req.session.phoneNumber!;
    }
    // Case 3: Unauthenticated user booking (public appointment)
    else if (clientPhone && clientName) {
      finalClientPhone = clientPhone;
      finalClientName = clientName;

      // Find or create user - AUTO-REGISTRATION
      const userSnapshot = await collections.users
        .where('phoneNumber', '==', clientPhone)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        // Auto-register new user
        const newUserRef = await collections.users.add({
          phoneNumber: clientPhone,
          name: clientName,
          role: 'client',
          verified: false, // They can verify later via OTP login
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        finalUserId = newUserRef.id;

        console.log(`✅ Auto-registered new user: ${clientName} (${clientPhone})`);
      } else {
        finalUserId = userSnapshot.docs[0].id;
        // Update name if provided
        await userSnapshot.docs[0].ref.update({
          name: clientName,
          updatedAt: new Date(),
        });

        console.log(`✅ Found existing user: ${clientName} (${clientPhone})`);
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Either authenticate or provide clientPhone and clientName',
      });
    }

    // Create the appointment
    const appointmentData: any = {
      userId: finalUserId,
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      propertyAddress: finalPropertyAddress,
      dateTime: new Date(finalDateTime),
      type: finalType,
      preferredDate: new Date(finalDateTime), // Legacy field
      preferredTime: preferredTime || new Date(finalDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      notes: notes || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only include zpid if it's defined (Firestore doesn't allow undefined values)
    if (finalZpid) {
      appointmentData.zpid = finalZpid;
    }

    const docRef = await collections.appointments.add(appointmentData);

    // Fetch the created appointment to return it
    const createdDoc = await docRef.get();
    const createdAppointment = {
      id: docRef.id,
      ...createdDoc.data(),
      dateTime: appointmentData.dateTime.toISOString(),
      createdAt: appointmentData.createdAt.toISOString(),
      updatedAt: appointmentData.updatedAt.toISOString(),
    };

    // Auto-complete milestones when booking appointment
    try {
      const progressSnapshot = await collections.progress
        .where('userId', '==', finalClientPhone)
        .limit(1)
        .get();

      if (!progressSnapshot.empty) {
        const progressDoc = progressSnapshot.docs[0];
        const progressData = progressDoc.data();
        const updates: any = { updatedAt: new Date() };

        // Auto-complete Step 6 (Search Properties) if not done
        const step6Data = progressData?.milestones?.step6_searchProperties;
        if (!step6Data || step6Data.status !== 'completed') {
          updates[`milestones.step6_searchProperties`] = {
            status: 'completed',
            completedAt: new Date(),
            data: { autoCompleted: true, reason: 'appointment_booked' },
          };
          console.log(`✅ Auto-completed step 6 for user ${finalClientPhone}`);
        }

        // Auto-complete Step 7 (Book Viewings) since they just booked
        const step7Data = progressData?.milestones?.step7_bookViewing;
        if (!step7Data || step7Data.status !== 'completed') {
          updates[`milestones.step7_bookViewing`] = {
            status: 'completed',
            completedAt: new Date(),
            data: {
              appointmentId: docRef.id,
              propertyAddress: finalPropertyAddress,
              zpid: finalZpid,
              scheduledDate: appointmentData.dateTime,
              autoCompleted: true,
            },
          };
          console.log(`✅ Auto-completed step 7 for user ${finalClientPhone}`);
        }

        await progressDoc.ref.update(updates);
      }
    } catch (progressError) {
      // Don't fail the appointment if progress update fails
      console.error('Failed to update progress:', progressError);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully. You can now log in with your phone number to view your appointments.',
      appointment: createdAppointment, // Return the full appointment object for mobile app
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
      appointments: appointments, // Changed from 'data' to 'appointments' for mobile app
      data: appointments, // Keep 'data' for backwards compatibility with web app
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

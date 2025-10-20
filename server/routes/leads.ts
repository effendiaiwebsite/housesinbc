/**
 * Leads Routes
 *
 * Handle lead capture from various sources across the website.
 */

import { Router, Request, Response } from 'express';
import { collections } from '../db';
import { leadSchema } from '../../shared/schema';
import { validateBody, requireAdmin } from '../middleware';

const router = Router();

/**
 * POST /api/leads
 * Create a new lead (public endpoint)
 */
router.post('/', validateBody(leadSchema), async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber, email, source, metadata } = req.body;

    // Create lead document
    const leadRef = await collections.leads.add({
      name,
      phoneNumber,
      email: email || null,
      source,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      id: leadRef.id,
      message: 'Lead captured successfully',
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({
      error: 'Failed to capture lead',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/leads
 * Get all leads (admin only)
 */
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { source, limit = '100', offset = '0' } = req.query;

    let query = collections.leads.orderBy('createdAt', 'desc');

    // Filter by source if provided
    if (source && typeof source === 'string') {
      query = collections.leads
        .where('source', '==', source)
        .orderBy('createdAt', 'desc') as any;
    }

    // Apply pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    const snapshot = await query.limit(limitNum).offset(offsetNum).get();

    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    // Get total count
    const totalSnapshot = source
      ? await collections.leads.where('source', '==', source).count().get()
      : await collections.leads.count().get();

    return res.json({
      leads,
      total: totalSnapshot.data().count,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({
      error: 'Failed to fetch leads',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/leads/:id
 * Get a single lead by ID (admin only)
 */
router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await collections.leads.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    return res.json({
      lead: {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return res.status(500).json({
      error: 'Failed to fetch lead',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/leads/:id
 * Delete a lead (admin only)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await collections.leads.doc(id).delete();

    return res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return res.status(500).json({
      error: 'Failed to delete lead',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/leads/stats/by-source
 * Get lead counts by source (admin only)
 */
router.get('/stats/by-source', requireAdmin, async (req: Request, res: Response) => {
  try {
    const sources = ['landing', 'mortgage', 'incentives', 'pricing', 'blog', 'properties', 'calculator'];

    const stats = await Promise.all(
      sources.map(async (source) => {
        const snapshot = await collections.leads.where('source', '==', source).count().get();
        return {
          source,
          count: snapshot.data().count,
        };
      })
    );

    return res.json({ stats });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return res.status(500).json({
      error: 'Failed to fetch lead stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

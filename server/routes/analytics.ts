/**
 * Analytics API Routes
 *
 * Admin-only endpoints for dashboard analytics and statistics
 */

import { Router } from 'express';
import { collections } from '../db';
import { requireAdmin } from '../middleware';

const router = Router();

/**
 * GET /api/analytics/stats
 * Get overview statistics for admin dashboard
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get total leads count
    const leadsSnapshot = await collections.leads.get();
    const totalLeads = leadsSnapshot.size;

    // Get leads by source
    const leadsBySource: Record<string, number> = {};
    leadsSnapshot.forEach(doc => {
      const data = doc.data();
      const source = data.source || 'unknown';
      leadsBySource[source] = (leadsBySource[source] || 0) + 1;
    });

    // Get total appointments count
    const appointmentsSnapshot = await collections.appointments.get();
    const totalAppointments = appointmentsSnapshot.size;

    // Get appointments by status
    const appointmentsByStatus: Record<string, number> = {};
    appointmentsSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'unknown';
      appointmentsByStatus[status] = (appointmentsByStatus[status] || 0) + 1;
    });

    // Get recent leads (last 10)
    const recentLeadsSnapshot = await collections.leads
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentLeads = recentLeadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    // Get newsletter subscribers count
    const newsletterSnapshot = await collections.newsletters.get();
    const totalSubscribers = newsletterSnapshot.size;

    // Calculate conversion rate (appointments / leads)
    const conversionRate = totalLeads > 0
      ? ((totalAppointments / totalLeads) * 100).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        overview: {
          totalLeads,
          totalAppointments,
          totalSubscribers,
          conversionRate: `${conversionRate}%`,
        },
        leadsBySource,
        appointmentsByStatus,
        recentLeads,
      },
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/leads-trend
 * Get leads trend data for charts (last 30 days)
 */
router.get('/leads-trend', requireAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await collections.leads
      .where('createdAt', '>=', thirtyDaysAgo)
      .orderBy('createdAt', 'asc')
      .get();

    // Group by date
    const trendData: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt?.toDate?.() || new Date(data.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      trendData[dateKey] = (trendData[dateKey] || 0) + 1;
    });

    // Convert to array format for charts
    const trend = Object.entries(trendData).map(([date, count]) => ({
      date,
      count,
    }));

    res.json({
      success: true,
      data: trend,
    });
  } catch (error: any) {
    console.error('Leads trend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads trend',
      details: error.message
    });
  }
});

export default router;

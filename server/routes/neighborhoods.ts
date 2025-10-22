/**
 * Neighborhoods Routes
 *
 * API endpoints for neighborhood information and statistics.
 */

import { Router, Request, Response } from 'express';
import zillowService from '../services/zillow';

const router = Router();

/**
 * GET /api/neighborhoods
 * Get list of popular BC neighborhoods with statistics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const neighborhoods = await zillowService.getBCNeighborhoods();

    return res.json({
      success: true,
      data: neighborhoods,
    });
  } catch (error) {
    console.error('Neighborhoods error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch neighborhoods',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/neighborhoods/:location
 * Get detailed information about a specific neighborhood
 */
router.get('/:location', async (req: Request, res: Response) => {
  try {
    const location = decodeURIComponent(req.params.location);

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required',
      });
    }

    const neighborhoodInfo = await zillowService.getNeighborhoodInfo(location);

    return res.json({
      success: true,
      data: neighborhoodInfo,
    });
  } catch (error) {
    console.error('Neighborhood info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch neighborhood information',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

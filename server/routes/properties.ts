/**
 * Properties Routes
 *
 * API endpoints for property search and details via Zillow integration.
 */

import { Router, Request, Response } from 'express';
import zillowService from '../services/zillow';

const router = Router();

/**
 * GET /api/properties/search
 * Search for properties with filters
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      location = 'British Columbia',
      status_type = 'ForSale',
      home_type,
      minPrice,
      maxPrice,
      beds,
      baths,
      page = 1,
    } = req.query;

    const searchParams = {
      location: location as string,
      status_type: status_type as any,
      home_type: home_type as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      beds: beds ? Number(beds) : undefined,
      baths: baths ? Number(baths) : undefined,
      page: Number(page),
    };

    const results = await zillowService.searchProperties(searchParams);

    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Property search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search properties',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/properties/:zpid
 * Get detailed property information by ZPID
 */
router.get('/:zpid', async (req: Request, res: Response) => {
  try {
    const { zpid } = req.params;

    if (!zpid) {
      return res.status(400).json({
        success: false,
        error: 'ZPID is required',
      });
    }

    const propertyDetails = await zillowService.getPropertyDetails(zpid);

    return res.json({
      success: true,
      data: propertyDetails,
    });
  } catch (error) {
    console.error('Property details error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch property details',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

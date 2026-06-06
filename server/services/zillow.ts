/**
 * Zillow Live Data Scraper API Service
 *
 * Uses zillow-com-live-data-scraper-api.p.rapidapi.com
 */

import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'zillow-com-live-data-scraper-api.p.rapidapi.com';

// In-memory cache so property details can be looked up after a search
const propertyCache = new Map<string, any>();

interface SearchParams {
  location: string;
  status_type?: 'ForSale' | 'ForRent' | 'RecentlySold';
  home_type?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  page?: number;
}

// "Vancouver, BC" -> "vancouver-bc"  |  "British Columbia" -> "british-columbia"
function toLocationSlug(location: string): string {
  return location
    .toLowerCase()
    .replace(/,\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// "4685 Valley Dr #304, Vancouver, BC V6J 5M2" -> { street, city, state, zipcode }
function parseAddress(fullAddress: string) {
  const parts = fullAddress.split(', ');
  if (parts.length >= 3) {
    const street = parts[0];
    const city = parts[1];
    const lastPart = parts[parts.length - 1]; // e.g. "BC V6J 5M2"
    const spaceIdx = lastPart.indexOf(' ');
    const state = spaceIdx > 0 ? lastPart.substring(0, spaceIdx) : lastPart;
    const zipcode = spaceIdx > 0 ? lastPart.substring(spaceIdx + 1) : '';
    return { street, city, state, zipcode };
  }
  return { street: fullAddress, city: '', state: 'BC', zipcode: '' };
}

// Map a raw API result to the shape the mobile app and web expect
function mapProperty(p: any) {
  const { street, city, state, zipcode } = parseAddress(p.address || '');
  const mapped = {
    zpid: String(p.zpid),
    address: street,
    city,
    state,
    zipcode,
    price: p.price || 0,
    beds: p.beds || 0,
    baths: p.baths || 0,
    sqft: p.sqft || 0,
    propertyType: p.property_type || 'Unknown',
    listingStatus: (p.status || 'FOR_SALE').replace(/_/g, ' '),
    imgSrc: p.photo_url || '',
    latitude: p.latitude || 0,
    longitude: p.longitude || 0,
    listingUrl: p.url || '',
    brokerage: p.brokerage || '',
  };
  // Cache every result so getPropertyDetails can look it up
  propertyCache.set(mapped.zpid, mapped);
  return mapped;
}

/**
 * Search for properties by location
 */
export async function searchProperties(params: SearchParams): Promise<any> {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw new Error('RapidAPI key is not configured. Please set RAPIDAPI_KEY in your environment.');
  }

  const locationSlug = toLocationSlug(params.location);
  const listType = params.status_type === 'ForRent' ? 'for-rent' : 'for-sale';

  const queryParams: Record<string, any> = {
    location: locationSlug,
    listType,
    page: params.page || 1,
  };

  if (params.minPrice) queryParams.minPrice = params.minPrice;
  if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
  if (params.beds)     queryParams.beds = params.beds;
  if (params.baths)    queryParams.baths = params.baths;

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}/bylocation`, {
      params: queryParams,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      timeout: 15000,
    });

    const results = (response.data.results || []).map(mapProperty);
    const pagination = response.data.pagination || {};

    return {
      props: results,
      totalResultCount: pagination.total_results || results.length,
      totalPages: pagination.total_pages || 1,
      currentPage: pagination.current_page || 1,
      hasNext: pagination.has_next || false,
    };
  } catch (error: any) {
    const status = error.response?.status;
    const detail = error.response?.data?.message || error.message;
    console.error(`Zillow API Error (HTTP ${status}):`, detail);

    if (status === 401 || status === 403) {
      throw new Error('Property search is temporarily unavailable. Please try again later.');
    }
    if (status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error(`Unable to fetch properties: ${detail}`);
  }
}

/**
 * Get property details by ZPID.
 * The live scraper API has no dedicated detail endpoint, so we return
 * from the in-memory cache populated during searchProperties.
 */
export async function getPropertyDetails(zpid: string): Promise<any> {
  const cached = propertyCache.get(zpid);
  if (cached) return cached;

  // Not in cache — do a broad BC search to find it
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw new Error('RapidAPI key is not configured.');
  }

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}/bylocation`, {
      params: { location: 'british-columbia', listType: 'for-sale', page: 1 },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      timeout: 15000,
    });

    (response.data.results || []).forEach((p: any) => mapProperty(p));
    const found = propertyCache.get(zpid);
    if (found) return found;

    throw new Error('Property not found. Please go back and search again.');
  } catch (error: any) {
    if (error.message.includes('Property not found')) throw error;
    const status = error.response?.status;
    const detail = error.response?.data?.message || error.message;
    throw new Error(`Unable to fetch property details: ${detail}`);
  }
}

/**
 * Get neighborhood/area information
 */
export async function getNeighborhoodInfo(location: string): Promise<any> {
  const results = await searchProperties({ location, status_type: 'ForSale' });
  const props = results.props || [];

  const prices = props.map((p: any) => p.price).filter((p: number) => p > 0);
  const avgPrice = prices.length > 0
    ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length)
    : 0;

  const propertyTypes: Record<string, number> = {};
  props.forEach((p: any) => {
    const type = p.propertyType || 'Unknown';
    propertyTypes[type] = (propertyTypes[type] || 0) + 1;
  });

  return {
    location,
    totalListings: results.totalResultCount || props.length,
    averagePrice: avgPrice,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
    propertyTypes,
    sample: props.slice(0, 6),
  };
}

/**
 * Get popular BC neighborhoods
 */
export async function getBCNeighborhoods(): Promise<any[]> {
  const bcNeighborhoods = [
    'Vancouver, BC',
    'Burnaby, BC',
    'Richmond, BC',
    'Surrey, BC',
    'Coquitlam, BC',
    'North Vancouver, BC',
    'West Vancouver, BC',
    'New Westminster, BC',
  ];

  const results = await Promise.allSettled(
    bcNeighborhoods.map(async (location) => {
      try {
        const data = await getNeighborhoodInfo(location);
        return { ...data, name: location };
      } catch {
        return null;
      }
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value);
}

export default {
  searchProperties,
  getPropertyDetails,
  getNeighborhoodInfo,
  getBCNeighborhoods,
};

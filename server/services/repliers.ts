/**
 * Repliers Real Estate API Service
 *
 * Replaces the old Zillow integration. Uses api.repliers.io.
 * Auth: REPLIERS-API-KEY header
 */

import axios from 'axios';

const REPLIERS_API_KEY = process.env.REPLIERS_API_KEY;
const REPLIERS_BASE_URL = 'https://api.repliers.io';

// Cache so detail lookups can reuse search results
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

function buildStreetAddress(address: any): string {
  return [
    address.unitNumber ? `#${address.unitNumber}` : null,
    address.streetNumber,
    address.streetName,
    address.streetSuffix,
  ]
    .filter(Boolean)
    .join(' ');
}

const REPLIERS_CDN = 'https://cdn.repliers.io/';

function normalizeImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return REPLIERS_CDN + url;
}

function mapListing(listing: any) {
  const address = listing.address || {};
  const details = listing.details || {};
  const map = listing.map || {};

  const streetAddress = buildStreetAddress(address);
  const rawImages: string[] = listing.images || [];
  const images = rawImages.map(normalizeImageUrl).filter(Boolean);
  const imgSrc = images[0] || '';
  const photos = images.map((url: string) => ({ url }));

  const listPrice = listing.listPrice ? parseFloat(listing.listPrice) : 0;
  const soldPrice = listing.soldPrice ? parseFloat(String(listing.soldPrice)) : 0;
  const price = listPrice || soldPrice;

  const status = listing.status;
  let listingStatus: string;
  if (status === 'A') listingStatus = 'Active';
  else if (status === 'U') listingStatus = listing.lastStatus || 'Unavailable';
  else listingStatus = listing.lastStatus || status || '';

  const mapped: any = {
    // ID — mlsNumber is used as zpid so existing routes work unchanged
    zpid: listing.mlsNumber,
    mlsNumber: listing.mlsNumber,

    // Address
    address: streetAddress,
    streetAddress,
    city: address.city || '',
    state: address.state || 'BC',
    zipcode: address.zip || '',

    // Pricing — use null instead of 0 so UI can skip "Contact for price"
    price: price || null,
    listPrice: listPrice || null,
    soldPrice: soldPrice || null,

    // Specs — use null when unknown so UI skips "0 beds" / "0 sqft"
    bedrooms: details.numBedrooms || null,
    bathrooms: details.numBathrooms || null,
    beds: details.numBedrooms || null,
    baths: details.numBathrooms || null,
    livingArea: details.sqft ? (parseInt(String(details.sqft), 10) || null) : null,
    sqft: details.sqft ? (parseInt(String(details.sqft), 10) || null) : null,

    // Type & status
    propertyType: details.propertyType || '',
    homeType: details.propertyType || '',
    listingStatus,
    type: listing.type || '',
    class: listing.class || '',

    // Images
    imgSrc,
    photos,
    images,

    // Location
    latitude: map.latitude || 0,
    longitude: map.longitude || 0,

    // Extra details
    brokerage: listing.brokerage || '',
    description: details.description || '',
    yearBuilt: details.yearBuilt ? (parseInt(String(details.yearBuilt), 10) || null) : null,
    parkingSpaces: details.numParkingSpaces || null,
    lotSize: null, // Repliers does not expose lot size in this schema
    listDate: listing.listDate || '',
    virtualTourUrl: details.virtualTourUrl || '',
  };

  propertyCache.set(mapped.zpid, mapped);
  return mapped;
}

// Map status_type to Repliers body params
function buildTypeFilter(status_type?: string): Record<string, any> {
  if (status_type === 'ForRent') return { type: ['lease'] };
  if (status_type === 'RecentlySold') return { lastStatus: ['Sld'], status: ['U'] };
  // ForSale default
  return { type: ['sale'], status: ['A'] };
}

// Map our home_type labels to Repliers propertyType values
const HOME_TYPE_MAP: Record<string, string[]> = {
  Houses: ['Detached', 'Semi-Detached', 'Detached-Variable'],
  Condos: ['Condo Apt', 'Apartment/Condo'],
  Townhomes: ['Att/Row/Twnhouse', 'Townhouse', 'Semi-Det Condo'],
  Apartments: ['Condo Apt', 'Apartment/Condo', 'Co-Op Apt'],
};

/**
 * Search listings via POST /listings
 */
export async function searchProperties(params: SearchParams): Promise<any> {
  if (!REPLIERS_API_KEY) {
    throw new Error(
      'Repliers API key is not configured. Please set REPLIERS_API_KEY in your .env file.'
    );
  }

  const body: Record<string, any> = {
    pageNum: params.page || 1,
    resultsPerPage: 20,
    sortBy: 'updatedOnDesc',
    ...buildTypeFilter(params.status_type),
  };

  // Location: "British Columbia" → no city filter (return all from key's MLS access)
  // "Vancouver, BC" or "Vancouver" → city filter
  const loc = (params.location || '').trim();
  const isBCGeneric = /^british columbia$/i.test(loc) || loc === '';
  if (!isBCGeneric) {
    const cityPart = loc.split(',')[0].trim();
    if (cityPart) body.city = [cityPart];
  }

  if (params.minPrice) body.minPrice = params.minPrice;
  if (params.maxPrice) body.maxPrice = params.maxPrice;
  if (params.beds) body.minBedrooms = params.beds;
  if (params.baths) body.minBaths = params.baths;

  if (params.home_type && HOME_TYPE_MAP[params.home_type]) {
    body.propertyType = HOME_TYPE_MAP[params.home_type];
  }

  try {
    const response = await axios.post(`${REPLIERS_BASE_URL}/listings`, body, {
      headers: {
        'REPLIERS-API-KEY': REPLIERS_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const listings = (response.data.listings || []).map(mapListing);

    return {
      props: listings,
      totalResultCount: response.data.count || listings.length,
      totalPages: response.data.numPages || 1,
      currentPage: response.data.page || 1,
      hasNext: (response.data.page || 1) < (response.data.numPages || 1),
    };
  } catch (error: any) {
    const status = error.response?.status;
    const detail = error.response?.data?.message || error.message;
    console.error(`Repliers API Error (HTTP ${status}):`, detail);

    if (status === 401 || status === 403) {
      throw new Error('Property search unavailable — check your REPLIERS_API_KEY.');
    }
    if (status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error(`Unable to fetch properties: ${detail}`);
  }
}

/**
 * Get a single listing by mlsNumber via GET /listings/{mlsNumber}
 */
export async function getPropertyDetails(mlsNumber: string): Promise<any> {
  const cached = propertyCache.get(mlsNumber);
  if (cached) return cached;

  if (!REPLIERS_API_KEY) {
    throw new Error('Repliers API key is not configured.');
  }

  try {
    const response = await axios.get(`${REPLIERS_BASE_URL}/listings/${mlsNumber}`, {
      headers: { 'REPLIERS-API-KEY': REPLIERS_API_KEY },
      timeout: 15000,
    });

    return mapListing(response.data);
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 404) {
      throw new Error('Listing not found. Please go back and search again.');
    }
    const detail = error.response?.data?.message || error.message;
    throw new Error(`Unable to fetch listing details: ${detail}`);
  }
}

/**
 * Get market stats for a location (used by neighborhoods endpoint)
 */
export async function getNeighborhoodInfo(location: string): Promise<any> {
  const results = await searchProperties({ location, status_type: 'ForSale' });
  const props = results.props || [];

  const prices = props.map((p: any) => p.price).filter((p: number) => p > 0);
  const avgPrice =
    prices.length > 0
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
 * Fetch neighborhood stats for the 8 major BC cities
 */
export async function getBCNeighborhoods(): Promise<any[]> {
  const bcCities = [
    'Vancouver',
    'Burnaby',
    'Richmond',
    'Surrey',
    'Coquitlam',
    'North Vancouver',
    'West Vancouver',
    'New Westminster',
  ];

  const results = await Promise.allSettled(
    bcCities.map(async (city) => {
      try {
        const data = await getNeighborhoodInfo(city);
        return { ...data, name: `${city}, BC` };
      } catch {
        return null;
      }
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value);
}

export default {
  searchProperties,
  getPropertyDetails,
  getNeighborhoodInfo,
  getBCNeighborhoods,
};

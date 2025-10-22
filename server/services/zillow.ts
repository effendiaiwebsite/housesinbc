/**
 * Zillow API Service
 *
 * Integrates with Zillow API via RapidAPI to fetch property listings and neighborhood data.
 */

import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'zillow-com1.p.rapidapi.com';

interface ZillowProperty {
  zpid: string;
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  homeType: string;
  imgSrc: string;
  latitude: number;
  longitude: number;
  listingStatus?: string;
  daysOnZillow?: number;
}

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

/**
 * Search for properties on Zillow
 */
export async function searchProperties(params: SearchParams): Promise<any> {
  try {
    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}/propertyExtendedSearch`,
      params: {
        location: params.location,
        status_type: params.status_type || 'ForSale',
        home_type: params.home_type,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        bedsMin: params.beds,
        bathsMin: params.baths,
        page: params.page || 1,
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error: any) {
    console.error('Zillow API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch properties from Zillow');
  }
}

/**
 * Get property details by Zillow Property ID (ZPID)
 */
export async function getPropertyDetails(zpid: string): Promise<any> {
  try {
    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}/property`,
      params: { zpid },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error: any) {
    console.error('Zillow API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch property details from Zillow');
  }
}

/**
 * Get neighborhood/area information
 */
export async function getNeighborhoodInfo(location: string): Promise<any> {
  try {
    // For neighborhoods, we'll search for properties in the area and aggregate data
    const properties = await searchProperties({ location, status_type: 'ForSale' });

    // Extract neighborhood statistics
    const stats = {
      location,
      totalListings: properties.totalResultCount || properties.totalPages || 0,
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      propertyTypes: {} as Record<string, number>,
      sample: properties.props?.slice(0, 6) || properties.results?.slice(0, 6) || [],
    };

    const resultsList = properties.props || properties.results || [];

    if (resultsList && resultsList.length > 0) {
      const prices = resultsList.map((p: any) => p.price || p.unformattedPrice).filter((p: number) => p > 0);

      stats.averagePrice = prices.length > 0
        ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length)
        : 0;

      stats.priceRange.min = prices.length > 0 ? Math.min(...prices) : 0;
      stats.priceRange.max = prices.length > 0 ? Math.max(...prices) : 0;

      // Count property types
      resultsList.forEach((p: any) => {
        const type = p.propertyType || p.homeType || 'Unknown';
        stats.propertyTypes[type] = (stats.propertyTypes[type] || 0) + 1;
      });
    }

    return stats;
  } catch (error: any) {
    console.error('Zillow API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch neighborhood information from Zillow');
  }
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

  const neighborhoodsData = await Promise.allSettled(
    bcNeighborhoods.map(async (location) => {
      try {
        const data = await getNeighborhoodInfo(location);
        return { ...data, name: location };
      } catch (error) {
        console.error(`Error fetching data for ${location}:`, error);
        return null;
      }
    })
  );

  return neighborhoodsData
    .filter((result): result is PromiseFulfilledResult<any> =>
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}

export default {
  searchProperties,
  getPropertyDetails,
  getNeighborhoodInfo,
  getBCNeighborhoods,
};

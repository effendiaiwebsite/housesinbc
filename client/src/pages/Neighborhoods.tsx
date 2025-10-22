/**
 * Neighborhoods Page
 *
 * Browse popular BC neighborhoods with live market data from Zillow.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { neighborhoodsAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function Neighborhoods() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    setLoading(true);
    try {
      const response = await neighborhoodsAPI.getAll();
      if (response.success) {
        setNeighborhoods(response.data || []);
      }
    } catch (error: any) {
      console.error('Error loading neighborhoods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load neighborhoods. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExploreNeighborhood = (location: string) => {
    // Navigate to properties page with this location pre-selected
    setLocation(`/properties?location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Explore BC Neighborhoods
          </h1>
          <p className="text-xl opacity-90">
            Discover the perfect community to call home across British Columbia
          </p>
        </div>
      </section>

      {/* Neighborhoods Grid */}
      <section className="py-16 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Popular Neighborhoods</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse current market statistics and available properties in British Columbia's
              most sought-after communities
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading neighborhoods...</p>
            </div>
          ) : neighborhoods.length === 0 ? (
            <div className="text-center py-20">
              <i className="fas fa-map-marked-alt text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No neighborhood data available
              </h3>
              <p className="text-gray-500">Please check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {neighborhoods.map((neighborhood: any, index: number) => (
                <Card
                  key={neighborhood.name || index}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail from sample properties */}
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden relative">
                    {neighborhood.sample?.[0]?.imgSrc ? (
                      <img
                        src={neighborhood.sample[0].imgSrc}
                        alt={neighborhood.name}
                        className="w-full h-full object-cover opacity-90"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-city text-6xl text-white opacity-50"></i>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white">
                        {neighborhood.name || neighborhood.location}
                      </h3>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">Market Overview</CardTitle>
                    <CardDescription>
                      Current real estate statistics
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Total Listings */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          <i className="fas fa-home mr-2"></i>
                          Total Listings
                        </span>
                        <span className="font-semibold">
                          {neighborhood.totalListings?.toLocaleString() || 'N/A'}
                        </span>
                      </div>

                      {/* Average Price */}
                      {neighborhood.averagePrice > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            Avg. Price
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {formatCurrency(neighborhood.averagePrice)}
                          </span>
                        </div>
                      )}

                      {/* Price Range */}
                      {neighborhood.priceRange?.min > 0 && neighborhood.priceRange?.max > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            <i className="fas fa-chart-line mr-2"></i>
                            Price Range
                          </span>
                          <span className="text-xs font-medium">
                            {formatCurrency(neighborhood.priceRange.min)} -{' '}
                            {formatCurrency(neighborhood.priceRange.max)}
                          </span>
                        </div>
                      )}

                      {/* Property Types */}
                      {neighborhood.propertyTypes &&
                        Object.keys(neighborhood.propertyTypes).length > 0 && (
                          <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500 mb-2">Property Types</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(neighborhood.propertyTypes)
                                .slice(0, 3)
                                .map(([type, count]: [string, any]) => (
                                  <span
                                    key={type}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded"
                                  >
                                    {type}: {count}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>

                    <Button
                      onClick={() => handleExploreNeighborhood(neighborhood.location || neighborhood.name)}
                      className="w-full mt-6"
                    >
                      View Properties
                      <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Can't Find Your Neighborhood?</h3>
            <p className="text-lg mb-6 opacity-90">
              Search for properties in any location across British Columbia
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation('/properties')}
              className="px-8"
            >
              Search All Properties
              <i className="fas fa-search ml-2"></i>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

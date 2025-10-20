/**
 * Pricing/Neighborhoods Page
 *
 * BC neighborhood explorer with pricing data and lead capture.
 * Full map integration can be added in enhancement phase.
 */

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface Neighborhood {
  name: string;
  city: string;
  avgPrice: number;
  priceRange: string;
  crimeRate: string;
  schoolRating: number;
  walkScore: number;
  transitScore: number;
  amenities: string[];
}

export default function Pricing() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();
  const [sortBy, setSortBy] = useState<'price' | 'safety' | 'schools'>('price');

  const neighborhoods: Neighborhood[] = [
    {
      name: 'Surrey Central',
      city: 'Surrey',
      avgPrice: 650000,
      priceRange: '$500K-$800K',
      crimeRate: 'Medium',
      schoolRating: 7,
      walkScore: 75,
      transitScore: 85,
      amenities: ['SkyTrain', 'Shopping', 'Parks', 'Schools'],
    },
    {
      name: 'Burnaby Heights',
      city: 'Burnaby',
      avgPrice: 950000,
      priceRange: '$750K-$1.2M',
      crimeRate: 'Low',
      schoolRating: 9,
      walkScore: 85,
      transitScore: 90,
      amenities: ['Restaurants', 'SkyTrain', 'Schools', 'Community Center'],
    },
    {
      name: 'Langley Township',
      city: 'Langley',
      avgPrice: 720000,
      priceRange: '$550K-$900K',
      crimeRate: 'Low',
      schoolRating: 8,
      walkScore: 60,
      transitScore: 55,
      amenities: ['Parks', 'Schools', 'Shopping', 'Recreation'],
    },
    {
      name: 'Coquitlam West',
      city: 'Coquitlam',
      avgPrice: 800000,
      priceRange: '$650K-$1M',
      crimeRate: 'Low',
      schoolRating: 8,
      walkScore: 70,
      transitScore: 75,
      amenities: ['Evergreen Line', 'Parks', 'Schools', 'Shopping'],
    },
    {
      name: 'Maple Ridge',
      city: 'Maple Ridge',
      avgPrice: 680000,
      priceRange: '$500K-$850K',
      crimeRate: 'Medium',
      schoolRating: 7,
      walkScore: 55,
      transitScore: 45,
      amenities: ['Parks', 'Recreation', 'Schools', 'Nature'],
    },
    {
      name: 'New Westminster',
      city: 'New Westminster',
      avgPrice: 750000,
      priceRange: '$600K-$950K',
      crimeRate: 'Medium',
      schoolRating: 8,
      walkScore: 80,
      transitScore: 88,
      amenities: ['SkyTrain', 'Riverfront', 'Shopping', 'Historic'],
    },
  ];

  const handleViewDetails = (neighborhood: Neighborhood) => {
    trigger('pricing', { neighborhood: neighborhood.name, avgPrice: neighborhood.avgPrice });
  };

  const sortedNeighborhoods = [...neighborhoods].sort((a, b) => {
    if (sortBy === 'price') return a.avgPrice - b.avgPrice;
    if (sortBy === 'safety') return a.crimeRate.localeCompare(b.crimeRate);
    if (sortBy === 'schools') return b.schoolRating - a.schoolRating;
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            BC Neighborhood Explorer
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Explore pricing, amenities, and lifestyle data for BC's most popular neighborhoods
          </p>
        </div>
      </section>

      {/* Sort Controls */}
      <section className="bg-white border-b sticky top-16 z-30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {sortedNeighborhoods.length} neighborhoods
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === 'price' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('price')}
                >
                  Price
                </Button>
                <Button
                  variant={sortBy === 'safety' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('safety')}
                >
                  Safety
                </Button>
                <Button
                  variant={sortBy === 'schools' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('schools')}
                >
                  Schools
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedNeighborhoods.map((neighborhood) => (
              <Card key={neighborhood.name} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl">{neighborhood.name}</CardTitle>
                      <CardDescription>{neighborhood.city}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(neighborhood.avgPrice)}
                      </div>
                      <div className="text-xs text-gray-500">{neighborhood.priceRange}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Crime Rate</div>
                      <div className="font-semibold">{neighborhood.crimeRate}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Schools</div>
                      <div className="font-semibold">{neighborhood.schoolRating}/10</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Walk Score</div>
                      <div className="font-semibold">{neighborhood.walkScore}/100</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Transit Score</div>
                      <div className="font-semibold">{neighborhood.transitScore}/100</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <div className="text-xs text-gray-600 mb-2">Amenities:</div>
                    <div className="flex flex-wrap gap-2">
                      {neighborhood.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewDetails(neighborhood)}
                    className="w-full"
                    variant="outline"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Interactive Map Coming Soon</h2>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <i className="fas fa-map-marked-alt text-6xl mb-4"></i>
              <p className="text-xl">Interactive BC neighborhood map will be available here</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={close}
        source={source}
        metadata={metadata}
        onSuccess={onSuccess}
      />
    </div>
  );
}

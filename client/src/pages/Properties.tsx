/**
 * Properties Page
 *
 * Property search and listings with lead capture.
 * Zillow API integration can be added in enhancement phase.
 */

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function Properties() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();
  const [location, setLocation] = useState('');

  const handleViewProperty = (property: any) => {
    trigger('properties', { propertyId: property.id, address: property.address });
  };

  const handleSearch = () => {
    trigger('properties', { searchLocation: location });
  };

  // Sample properties
  const properties = [
    {
      id: 1,
      address: '123 Main St, Surrey, BC',
      price: 650000,
      beds: 3,
      baths: 2,
      sqft: 1500,
      type: 'House',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    },
    {
      id: 2,
      address: '456 Oak Ave, Burnaby, BC',
      price: 520000,
      beds: 2,
      baths: 2,
      sqft: 950,
      type: 'Condo',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
    },
    {
      id: 3,
      address: '789 Elm Rd, Langley, BC',
      price: 780000,
      beds: 4,
      baths: 3,
      sqft: 2100,
      type: 'Townhouse',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero & Search */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Find Your Dream Home
          </h1>
          <p className="text-xl mb-8 text-center opacity-90">
            Search properties across British Columbia
          </p>

          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter city or neighborhood..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 h-14 text-lg bg-white text-gray-900"
            />
            <Button onClick={handleSearch} size="lg" variant="secondary" className="px-8">
              <i className="fas fa-search mr-2"></i>
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <p className="text-gray-600">Recently listed homes in your area</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.address}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-blue-600">
                        {formatCurrency(property.price)}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {property.address}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>
                        <i className="fas fa-bed mr-1"></i>
                        {property.beds} beds
                      </span>
                      <span>
                        <i className="fas fa-bath mr-1"></i>
                        {property.baths} baths
                      </span>
                      <span>
                        <i className="fas fa-ruler-combined mr-1"></i>
                        {property.sqft} sqft
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {property.type}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleViewProperty(property)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Live MLS property search integration coming soon
            </p>
            <Button onClick={handleSearch} variant="outline" size="lg">
              Get Notified When Available
            </Button>
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

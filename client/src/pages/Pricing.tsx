/**
 * Pricing/Neighborhoods Page - Premium Design
 *
 * BC neighborhood explorer with pricing data and lead capture.
 */

import { useState } from 'react';
import { MapPin, TrendingUp, Shield, GraduationCap, Bus, Trees, DollarSign, ArrowUpDown } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-white to-background">
      <Navigation />

      {/* Hero - Premium Design */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-info"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-info mb-4 animate-fade-in-down">
            <MapPin className="w-4 h-4 mr-2" />
            {neighborhoods.length} Neighborhoods Available
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white leading-tight animate-fade-in-up">
            BC Neighborhood Explorer
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            Explore pricing, amenities, and lifestyle data for BC's most popular neighborhoods
          </p>
        </div>
      </section>

      {/* Sort Controls - Premium */}
      <section className="bg-white/80 backdrop-blur-lg border-y border-border/50 sticky top-20 z-30 py-6 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Showing <span className="font-semibold text-foreground">{sortedNeighborhoods.length}</span> neighborhoods</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <ArrowUpDown className="w-4 h-4" />
                <span>Sort by:</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === 'price' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('price')}
                  className={sortBy === 'price' ? 'gradient-primary text-white shadow-premium' : ''}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Price
                </Button>
                <Button
                  variant={sortBy === 'safety' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('safety')}
                  className={sortBy === 'safety' ? 'gradient-success text-white shadow-premium' : ''}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Safety
                </Button>
                <Button
                  variant={sortBy === 'schools' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('schools')}
                  className={sortBy === 'schools' ? 'gradient-warning text-white shadow-premium' : ''}
                >
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Schools
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Grid - Premium Design */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedNeighborhoods.map((neighborhood, index) => (
              <div
                key={neighborhood.name}
                className="premium-card p-6 space-y-6 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-display font-bold text-foreground">
                        {neighborhood.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{neighborhood.city}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-primary">
                      {formatCurrency(neighborhood.avgPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground bg-primary-light px-2 py-1 rounded-full mt-1">
                      {neighborhood.priceRange}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-success-light rounded-xl">
                    <div className="icon-badge-sm bg-success text-white flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Safety</div>
                      <div className="text-sm font-bold text-foreground truncate">{neighborhood.crimeRate}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-warning-light rounded-xl">
                    <div className="icon-badge-sm bg-warning text-white flex-shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Schools</div>
                      <div className="text-sm font-bold text-foreground">{neighborhood.schoolRating}/10</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-primary-light rounded-xl">
                    <div className="icon-badge-sm bg-primary text-white flex-shrink-0">
                      <Trees className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Walk Score</div>
                      <div className="text-sm font-bold text-foreground">{neighborhood.walkScore}/100</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-info-light rounded-xl">
                    <div className="icon-badge-sm bg-info text-white flex-shrink-0">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Transit</div>
                      <div className="text-sm font-bold text-foreground">{neighborhood.transitScore}/100</div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-3">Amenities</div>
                  <div className="flex flex-wrap gap-2">
                    {neighborhood.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1.5 bg-secondary text-foreground text-xs font-medium rounded-lg border border-border/50"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleViewDetails(neighborhood)}
                  className="w-full btn-premium gradient-primary text-white shadow-premium hover:shadow-premium-lg"
                >
                  View Details
                  <MapPin className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Placeholder - Premium */}
      <section className="py-20 bg-gradient-to-b from-white to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-primary-light rounded-full text-sm font-semibold text-primary">
              Coming Soon
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Interactive Map
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore neighborhoods with our interactive BC map
            </p>
          </div>

          <div className="premium-card p-12 flex items-center justify-center bg-gradient-to-br from-secondary to-background min-h-[400px]">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-2xl shadow-premium">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-foreground">
                  Interactive BC Neighborhood Map
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Explore all BC neighborhoods on an interactive map with real-time pricing and data
                </p>
              </div>
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

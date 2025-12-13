import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  MapPin,
  Clock,
  School,
  Trees,
  ShoppingCart,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface Neighborhood {
  id: string;
  name: string;
  emoji: string;
  priceRange: string;
  priceMin: number;
  priceMax: number;
  propertyTypes: string;
  commute: string;
  schools: string;
  parks: string;
  amenities: string;
  pros: string[];
  cons: string[];
  coordinates: [number, number];
}

const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'whalley',
    name: 'Whalley/City Centre',
    emoji: '🏙️',
    priceRange: '$400K - $550K',
    priceMin: 400000,
    priceMax: 550000,
    propertyTypes: 'Condos',
    commute: '0 mins (SkyTrain hub)',
    schools: '7/10',
    parks: '5+',
    amenities: 'Malls, restaurants, services',
    pros: ['Direct SkyTrain access', 'Shopping & dining', 'New developments'],
    cons: ['Higher density', 'Construction noise'],
    coordinates: [49.1897, -122.8476],
  },
  {
    id: 'fleetwood',
    name: 'Fleetwood',
    emoji: '🏘️',
    priceRange: '$650K - $850K',
    priceMin: 650000,
    priceMax: 850000,
    propertyTypes: 'Townhomes',
    commute: '10 mins to Surrey Central',
    schools: '8/10',
    parks: '10+',
    amenities: 'Community centers, libraries',
    pros: ['Family-friendly', 'Good schools', 'Lots of parks'],
    cons: ['Limited transit', 'Farther from Vancouver'],
    coordinates: [49.1747, -122.8010],
  },
  {
    id: 'clayton',
    name: 'Clayton',
    emoji: '🏡',
    priceRange: '$700K - $1M',
    priceMin: 700000,
    priceMax: 1000000,
    propertyTypes: 'Townhomes, Detached',
    commute: '15 mins to Guildford',
    schools: '9/10',
    parks: '8+',
    amenities: 'Shopping, rec centers',
    pros: ['Newer builds', 'Master-planned', 'Safe & clean'],
    cons: ['Less character', 'Suburban feel'],
    coordinates: [49.0719, -122.7347],
  },
  {
    id: 'cloverdale',
    name: 'Cloverdale',
    emoji: '🌾',
    priceRange: '$850K - $1.2M',
    priceMin: 850000,
    priceMax: 1200000,
    propertyTypes: 'Detached',
    commute: '20 mins to Langley SkyTrain',
    schools: '7/10',
    parks: '6+',
    amenities: 'Historic downtown, rodeo',
    pros: ['Historic charm', 'Community events', 'Character homes'],
    cons: ['Expensive', 'Older homes'],
    coordinates: [49.1042, -122.7281],
  },
  {
    id: 'south-surrey',
    name: 'South Surrey',
    emoji: '🏖️',
    priceRange: '$900K - $1.5M',
    priceMin: 900000,
    priceMax: 1500000,
    propertyTypes: 'Detached',
    commute: '25 mins to White Rock',
    schools: '9/10',
    parks: '12+',
    amenities: 'Beaches, golf courses',
    pros: ['Ocean views', 'Prestigious', 'Beach access'],
    cons: ['Pricey', 'Farther from transit'],
    coordinates: [49.0504, -122.7981],
  },
  {
    id: 'guildford',
    name: 'Guildford',
    emoji: '🛍️',
    priceRange: '$550K - $750K',
    priceMin: 550000,
    priceMax: 750000,
    propertyTypes: 'Townhomes',
    commute: '5 mins to Guildford Station',
    schools: '7/10',
    parks: '7+',
    amenities: 'Guildford Town Centre, services',
    pros: ['Shopping mall nearby', 'Good transit', 'Affordable'],
    cons: ['Busy area', 'Mixed neighborhoods'],
    coordinates: [49.1845, -122.7997],
  },
];

export default function Neighborhoods() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [interestedNeighborhoods, setInterestedNeighborhoods] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (neighborhoodId: string) => {
    setInterestedNeighborhoods((prev) => {
      if (prev.includes(neighborhoodId)) {
        return prev.filter((id) => id !== neighborhoodId);
      }
      return [...prev, neighborhoodId];
    });
  };

  const handleComplete = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    if (interestedNeighborhoods.length < 2) {
      alert('Please mark at least 2 neighborhoods as interested to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/progress/${user.id}/milestone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: 'step5_neighborhoods',
          status: 'completed',
          data: {
            interestedNeighborhoods,
            exploredCount: interestedNeighborhoods.length,
            completedAt: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLocation('/client/dashboard');
      } else {
        alert('Failed to save progress. Please try again.');
      }
    } catch (error) {
      console.error('Error saving neighborhood progress:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/client/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-100 rounded-full">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Explore Surrey Neighborhoods</h1>
                <p className="text-gray-600 mt-1">Step 5 of 8 • 20 minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Map Placeholder */}
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-green-100">
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Interactive Map</p>
                <p className="text-sm text-gray-500">
                  6 Surrey neighborhoods marked
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (Map integration requires Leaflet library)
                </p>
              </div>
            </div>
          </Card>

          {/* Progress Indicator */}
          <Card className="p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span className="font-semibold">
                  {interestedNeighborhoods.length}/6 Neighborhoods Marked
                </span>
              </div>
              <div className="text-sm">
                {interestedNeighborhoods.length >= 2
                  ? '✓ Ready to continue'
                  : `Mark ${2 - interestedNeighborhoods.length} more to continue`}
              </div>
            </div>
          </Card>

          {/* Neighborhood Cards Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Surrey Neighborhoods</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEIGHBORHOODS.map((neighborhood) => {
                const isInterested = interestedNeighborhoods.includes(neighborhood.id);

                return (
                  <Card
                    key={neighborhood.id}
                    className={`p-6 transition-all ${
                      isInterested
                        ? 'ring-2 ring-orange-500 bg-orange-50'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl mb-2">{neighborhood.emoji}</div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {neighborhood.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleInterest(neighborhood.id)}
                        className={`p-2 rounded-full transition-all ${
                          isInterested
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-600'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isInterested ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Price Range</div>
                      <div className="text-xl font-bold text-blue-600">
                        {neighborhood.priceRange}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {neighborhood.propertyTypes}
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{neighborhood.commute}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <School className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Schools: {neighborhood.schools}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trees className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{neighborhood.parks} parks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{neighborhood.amenities}</span>
                      </div>
                    </div>

                    {/* Pros */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-green-700 mb-1">PROS:</div>
                      <ul className="space-y-1">
                        {neighborhood.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-1 text-xs text-gray-700">
                            <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-red-700 mb-1">CONS:</div>
                      <ul className="space-y-1">
                        {neighborhood.cons.map((con, index) => (
                          <li key={index} className="text-xs text-gray-700">
                            • {con}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Interest Button */}
                    <button
                      onClick={() => toggleInterest(neighborhood.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                        isInterested
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                      }`}
                    >
                      {isInterested ? (
                        <span className="flex items-center justify-center gap-2">
                          <Heart className="h-4 w-4 fill-current" />
                          Interested
                        </span>
                      ) : (
                        'Mark as Interested'
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/client/dashboard')}
              disabled={isSubmitting}
            >
              Save & Exit
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSubmitting || interestedNeighborhoods.length < 2}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8"
            >
              {isSubmitting
                ? 'Saving...'
                : interestedNeighborhoods.length >= 2
                ? 'Complete & Continue'
                : `Mark ${2 - interestedNeighborhoods.length} More to Continue`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

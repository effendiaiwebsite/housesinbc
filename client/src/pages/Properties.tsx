/**
 * Properties Page
 *
 * Property search and listings with Zillow API integration.
 */

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import PropertyDetailsModal from '@/components/PropertyDetailsModal';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import SavePropertyModal from '@/components/SavePropertyModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { propertiesAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { X, Gift } from 'lucide-react';

export default function Properties() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();
  const { toast } = useToast();

  // Quiz data and filters
  const [quizData, setQuizData] = useState<any>(null);
  const [affordablePrice, setAffordablePrice] = useState<number>(0);
  const [interestedNeighborhoods, setInterestedNeighborhoods] = useState<string[]>([]);
  const [savedPropertiesCount, setSavedPropertiesCount] = useState(0);

  // Search & Filter State
  const [location, setLocation] = useState('British Columbia');
  const [statusType, setStatusType] = useState<'ForSale' | 'ForRent' | 'RecentlySold'>('ForSale');
  const [homeType, setHomeType] = useState<string>('');
  const [beds, setBeds] = useState<string>('');
  const [baths, setBaths] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Data State
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isSavePropertyModalOpen, setIsSavePropertyModalOpen] = useState(false);

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        location,
        status_type: statusType,
        page,
      };

      if (homeType) params.home_type = homeType;
      if (beds) params.beds = parseInt(beds);
      if (baths) params.baths = parseInt(baths);
      if (minPrice) params.minPrice = parseInt(minPrice);
      if (maxPrice) params.maxPrice = parseInt(maxPrice);

      const response = await propertiesAPI.search(params);

      if (response.success && response.data) {
        const resultsList = response.data.props || response.data.results || [];
        setProperties(resultsList);
        setTotalResults(response.data.totalResultCount || response.data.totalPages || resultsList.length);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: error.message || 'Failed to search properties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    setIsDetailsModalOpen(true);
  };

  const handleScheduleViewing = () => {
    setIsDetailsModalOpen(false); // Close details modal first

    // Small delay to ensure modal closes before opening appointment modal
    setTimeout(() => {
      setIsAppointmentModalOpen(true);
    }, 100);
  };

  const calculatePTTSavings = (homePrice: number): number => {
    if (homePrice <= 500000) {
      return homePrice * 0.01;
    }
    if (homePrice <= 835000) {
      const base = 500000 * 0.01;
      const excess = homePrice - 500000;
      const exemptionRate = 1 - (excess / 335000);
      return base + (excess * 0.02 * exemptionRate);
    }
    return 0;
  };

  const handleSaveProperty = async (property: any) => {
    setSelectedProperty(property);
    setIsSavePropertyModalOpen(true);

    // Track saved properties count and update milestone
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
      try {
        const newCount = savedPropertiesCount + 1;
        setSavedPropertiesCount(newCount);

        // Mark milestone complete when first property is saved
        if (newCount === 1) {
          await fetch(`/api/progress/${sessionId}/milestone`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              milestoneId: 'step6_searchProperties',
              status: 'completed',
              data: {
                savedCount: newCount,
                completedAt: new Date().toISOString(),
              },
            }),
          });
        }
      } catch (error) {
        console.error('Error updating milestone:', error);
      }
    }
  };

  const handleResetFilters = () => {
    setHomeType('');
    setBeds('');
    setBaths('');
    setMinPrice('');
    setMaxPrice('');
  };

  // Load quiz data and apply auto-filters
  useEffect(() => {
    const loadQuizData = async () => {
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) return;

      try {
        // Get quiz data
        const quizResponse = await fetch(`/api/quiz/response/${sessionId}`);
        const quizResult = await quizResponse.json();

        if (quizResult.success && quizResult.data) {
          const data = quizResult.data;
          setQuizData(data);
          setAffordablePrice(data.calculatedAffordability || 0);

          // Auto-apply filters from quiz
          if (data.calculatedAffordability) {
            setMaxPrice(data.calculatedAffordability.toString());
          }

          // Set property type based on quiz
          if (data.propertyType === 'condo') {
            setHomeType('Condos');
          } else if (data.propertyType === 'townhome') {
            setHomeType('Townhomes');
          } else if (data.propertyType === 'detached') {
            setHomeType('Houses');
          }
        }

        // Get interested neighborhoods from Step 5
        const progressResponse = await fetch(`/api/progress/${sessionId}`);
        const progressResult = await progressResponse.json();

        if (progressResult.success && progressResult.data) {
          const neighborhoodData = progressResult.data.milestones?.step5_neighborhoods?.data;
          if (neighborhoodData?.interestedNeighborhoods) {
            setInterestedNeighborhoods(neighborhoodData.interestedNeighborhoods);
          }
        }
      } catch (error) {
        console.error('Error loading quiz data:', error);
      }
    };

    loadQuizData();
  }, []);

  // Load initial properties
  useEffect(() => {
    handleSearch();
  }, []);

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
            Search live property listings across British Columbia
          </p>

          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Enter city or neighborhood..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 h-14 text-lg bg-white text-gray-900"
            />
            <Select value={statusType} onValueChange={(value: any) => setStatusType(value)}>
              <SelectTrigger className="w-[180px] h-14 bg-white text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ForSale">For Sale</SelectItem>
                <SelectItem value="ForRent">For Rent</SelectItem>
                <SelectItem value="RecentlySold">Recently Sold</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => handleSearch()}
              size="lg"
              variant="secondary"
              className="px-8"
              disabled={loading}
            >
              <i className="fas fa-search mr-2"></i>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Select value={homeType || undefined} onValueChange={(val) => setHomeType(val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Houses">Houses</SelectItem>
                <SelectItem value="Condos">Condos</SelectItem>
                <SelectItem value="Townhomes">Townhomes</SelectItem>
                <SelectItem value="Apartments">Apartments</SelectItem>
              </SelectContent>
            </Select>

            <Select value={beds || undefined} onValueChange={(val) => setBeds(val === 'any' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={baths || undefined} onValueChange={(val) => setBaths(val === 'any' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleSearch()}
                className="flex-1"
                disabled={loading}
              >
                Apply
              </Button>
              <Button onClick={handleResetFilters} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz-Based Filter Chips */}
      {quizData && (
        <section className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active Filters from Your Profile:</span>

              {affordablePrice > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  <span>Max Price: ${affordablePrice.toLocaleString()}</span>
                  <button
                    onClick={() => setMaxPrice('')}
                    className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {homeType && quizData.propertyType && (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                  <span>{homeType}</span>
                  <button
                    onClick={() => setHomeType('')}
                    className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {interestedNeighborhoods.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-full text-sm">
                  <span>{interestedNeighborhoods.length} Neighborhoods Selected</span>
                </div>
              )}

              {savedPropertiesCount > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                  <span>{savedPropertiesCount} Properties Saved</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Properties Grid */}
      <section className="py-16 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Property Listings</h2>
              <p className="text-gray-600">
                {loading ? 'Searching...' : `${totalResults.toLocaleString()} results found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <i className="fas fa-home text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property: any, index: number) => (
                  <Card
                    key={property.zpid || index}
                    className="overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={property.imgSrc || property.carouselPhotos?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                        alt={property.streetAddress || 'Property'}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400';
                        }}
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl text-blue-600">
                            {property.price ? formatCurrency(property.price) : 'Contact for price'}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {property.streetAddress || property.address}
                            {property.city && `, ${property.city}`}
                            {property.state && `, ${property.state}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-4">
                          {property.bedrooms !== undefined && (
                            <span>
                              <i className="fas fa-bed mr-1"></i>
                              {property.bedrooms} beds
                            </span>
                          )}
                          {property.bathrooms !== undefined && (
                            <span>
                              <i className="fas fa-bath mr-1"></i>
                              {property.bathrooms} baths
                            </span>
                          )}
                          {property.livingArea && (
                            <span>
                              <i className="fas fa-ruler-combined mr-1"></i>
                              {property.livingArea.toLocaleString()} sqft
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mb-4 flex gap-2 flex-wrap">
                        {property.homeType && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {property.homeType}
                          </span>
                        )}
                        {property.listingStatus && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {property.listingStatus}
                          </span>
                        )}
                        {property.price && calculatePTTSavings(property.price) > 0 && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            Save ${Math.round(calculatePTTSavings(property.price)).toLocaleString()} PTT
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveProperty(property)}
                          variant="outline"
                          className="flex-1"
                        >
                          <i className="fas fa-heart mr-2"></i>
                          Save
                        </Button>
                        <Button onClick={() => handleViewProperty(property)} className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalResults > properties.length && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2">
                    Page {currentPage}
                  </span>
                  <Button
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={loading}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <PropertyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        property={selectedProperty}
        onScheduleViewing={handleScheduleViewing}
      />

      <AppointmentBookingModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        propertyAddress={selectedProperty?.streetAddress || selectedProperty?.address || 'Property'}
        propertyDetails={{
          zpid: selectedProperty?.zpid,
          price: selectedProperty?.price || selectedProperty?.listPrice,
          beds: selectedProperty?.bedrooms || selectedProperty?.beds,
          baths: selectedProperty?.bathrooms || selectedProperty?.baths,
        }}
        onSuccess={() => {
          setIsAppointmentModalOpen(false);
          toast({
            title: 'Success!',
            description: 'You can now log in with your phone number to view your appointment.',
          });
        }}
      />

      <SavePropertyModal
        isOpen={isSavePropertyModalOpen}
        onClose={() => setIsSavePropertyModalOpen(false)}
        propertyData={{
          zpid: selectedProperty?.zpid || '',
          streetAddress: selectedProperty?.streetAddress || selectedProperty?.address || '',
          city: selectedProperty?.city,
          state: selectedProperty?.state,
          zipcode: selectedProperty?.zipcode,
          price: selectedProperty?.price,
          bedrooms: selectedProperty?.bedrooms,
          bathrooms: selectedProperty?.bathrooms,
          livingArea: selectedProperty?.livingArea,
          imgSrc: selectedProperty?.imgSrc || selectedProperty?.carouselPhotos?.[0]?.url,
        }}
        onSuccess={() => {
          toast({
            title: 'Property Saved!',
            description: 'Log in with your phone number to view all your saved properties.',
          });
        }}
      />

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

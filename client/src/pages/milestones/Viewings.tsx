import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Calendar, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SavedProperty {
  zpid: string;
  streetAddress: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imgSrc?: string;
}

export default function Viewings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<SavedProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking form
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Available time slots
  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  useEffect(() => {
    const loadSavedProperties = async () => {
      if (!user?.id) {
        setLocation('/client/login');
        return;
      }

      try {
        // In a real implementation, fetch saved properties from API
        // For now, use mock data
        const mockProperties: SavedProperty[] = [
          {
            zpid: '1',
            streetAddress: '123 Main St, Surrey, BC',
            price: 650000,
            bedrooms: 3,
            bathrooms: 2,
            imgSrc: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
          },
          {
            zpid: '2',
            streetAddress: '456 Oak Ave, Surrey, BC',
            price: 720000,
            bedrooms: 4,
            bathrooms: 3,
            imgSrc: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
          },
        ];

        setSavedProperties(mockProperties);
      } catch (error) {
        console.error('Error loading saved properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProperties();
  }, [user, setLocation]);

  const handleBookViewing = async () => {
    if (!user?.id || !selectedProperty) {
      alert('Please log in and select a property');
      return;
    }

    if (!selectedDate || !selectedTime || !phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyAddress: selectedProperty.streetAddress,
          propertyDetails: {
            zpid: selectedProperty.zpid,
            price: selectedProperty.price,
            beds: selectedProperty.bedrooms,
            baths: selectedProperty.bathrooms,
          },
          appointmentDate: `${selectedDate}T${selectedTime}`,
          phoneNumber,
          specialRequests,
          createdAt: new Date().toISOString(),
        }),
      });

      const appointmentResult = await appointmentResponse.json();

      if (!appointmentResult.success) {
        throw new Error('Failed to create appointment');
      }

      // Mark milestone complete
      const progressResponse = await fetch(`/api/progress/${user.id}/complete/step7_bookViewing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            appointmentIds: [appointmentResult.data.id],
            propertyAddress: selectedProperty.streetAddress,
            scheduledDate: `${selectedDate}T${selectedTime}`,
            completedAt: new Date().toISOString(),
          },
        }),
      });

      const progressResult = await progressResponse.json();

      if (progressResult.success) {
        alert('Viewing booked successfully! Rida will contact you to confirm.');
        setLocation('/client/dashboard');
      } else {
        alert('Appointment created but failed to update progress. Please contact support.');
      }
    } catch (error) {
      console.error('Error booking viewing:', error);
      alert('Failed to book viewing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
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
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Book Property Viewings</h1>
                <p className="text-gray-600 mt-1">Step 7 of 8 • 10 minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Saved Properties */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Saved Properties</h2>

            {savedProperties.length === 0 ? (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No saved properties yet</p>
                <Button onClick={() => setLocation('/properties')} variant="outline">
                  Browse Properties
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedProperties.map((property) => (
                  <Card
                    key={property.zpid}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedProperty?.zpid === property.zpid
                        ? 'ring-2 ring-purple-500 bg-purple-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={property.imgSrc || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200'}
                        alt={property.streetAddress}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200';
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-purple-600 mb-1">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{property.streetAddress}</div>
                        <div className="text-xs text-gray-600">
                          {property.bedrooms} beds • {property.bathrooms} baths
                        </div>
                      </div>
                      {selectedProperty?.zpid === property.zpid && (
                        <CheckCircle2 className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Booking Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Schedule a Viewing</h2>

            {!selectedProperty ? (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a property to book a viewing</p>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Selected Property:</div>
                  <div className="font-semibold">{selectedProperty.streetAddress}</div>
                </div>

                <div className="space-y-4">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 border rounded-lg text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <Clock className="h-4 w-4 inline mr-1" />
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (604) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any specific areas or features you'd like to see?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleBookViewing}
                    disabled={isSubmitting || !selectedDate || !selectedTime || !phoneNumber}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSubmitting ? 'Booking...' : 'Book Viewing with Rida'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Rida will contact you to confirm the viewing within 24 hours
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation('/client/dashboard')}
            disabled={isSubmitting}
          >
            Save & Exit
          </Button>
        </div>
      </div>
    </div>
  );
}

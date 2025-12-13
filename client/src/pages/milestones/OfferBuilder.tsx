import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  FileText,
  Home,
  DollarSign,
  Calendar,
  FileCheck,
  Trophy,
} from 'lucide-react';
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
}

export default function OfferBuilder() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [listingPrice, setListingPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [subjects, setSubjects] = useState({
    financing: true,
    inspection: true,
    saleOfProperty: false,
    other: false,
  });
  const [otherSubject, setOtherSubject] = useState('');
  const [offerExpiry, setOfferExpiry] = useState('');
  const [possessionDate, setPossessionDate] = useState('');
  const [depositAmount, setDepositAmount] = useState(10000);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Load saved properties
    const mockProperties: SavedProperty[] = [
      { zpid: '1', streetAddress: '123 Main St, Surrey, BC', price: 650000, bedrooms: 3, bathrooms: 2 },
      { zpid: '2', streetAddress: '456 Oak Ave, Surrey, BC', price: 720000, bedrooms: 4, bathrooms: 3 },
    ];
    setSavedProperties(mockProperties);

    // Set default dates
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    setOfferExpiry(twoDaysLater.toISOString().split('T')[0]);

    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
    setPossessionDate(sixtyDaysLater.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      const property = savedProperties.find((p) => p.zpid === selectedPropertyId);
      if (property) {
        setManualAddress(property.streetAddress);
        setListingPrice(property.price);
        setOfferPrice(Math.round(property.price * 0.95)); // Default 5% below listing
      }
    }
  }, [selectedPropertyId, savedProperties]);

  const percentBelowListing = listingPrice > 0
    ? Math.round(((listingPrice - offerPrice) / listingPrice) * 100)
    : 0;

  const handleOfferPriceChange = (value: number) => {
    setOfferPrice(Math.max(0, Math.min(listingPrice, value)));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    if (!manualAddress || !listingPrice || !offerPrice) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create offer (will be 'draft' status)
      const offerResponse = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          sessionId: user.id,
          offerData: {
            propertyZpid: selectedPropertyId || undefined,
            propertyAddress: manualAddress,
            propertyDetails: {
              price: listingPrice,
              beds: savedProperties.find((p) => p.zpid === selectedPropertyId)?.bedrooms,
              baths: savedProperties.find((p) => p.zpid === selectedPropertyId)?.bathrooms,
            },
            offerDetails: {
              offerPrice,
              subjects: [
                ...(subjects.financing ? ['financing'] : []),
                ...(subjects.inspection ? ['inspection'] : []),
                ...(subjects.saleOfProperty ? ['sale of property'] : []),
                ...(subjects.other && otherSubject ? [otherSubject] : []),
              ],
              expiryDate: offerExpiry,
              possessionDate,
              deposit: depositAmount,
              notes,
            },
          },
        }),
      });

      const offerResult = await offerResponse.json();

      if (!offerResult.success) {
        throw new Error(offerResult.error || 'Failed to create offer');
      }

      const offerId = offerResult.data?.offerId;

      if (!offerId) {
        throw new Error('No offer ID returned');
      }

      // Step 2: Submit the offer (changes status to 'submitted' and marks milestone complete)
      const submitResponse = await fetch(`/api/offers/${offerId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const submitResult = await submitResponse.json();

      if (submitResult.success) {
        // Show celebration!
        setShowCelebration(true);
      } else {
        throw new Error(submitResult.error || 'Failed to submit offer');
      }
    } catch (error: any) {
      console.error('Error submitting offer:', error);
      alert(error.message || 'Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="animate-bounce mb-6">
            <Trophy className="h-32 w-32 text-yellow-500 mx-auto" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Congratulations! 🎉
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            You've completed your home-buying journey!
          </p>

          <Card className="p-8 mb-8">
            <div className="mb-4">
              <div className="text-6xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-lg text-gray-600">Journey Complete</div>
            </div>

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 text-gray-700">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span>8/8 Milestones Completed</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Home className="h-5 w-5 text-green-600" />
                <span>Offer Submitted for Review</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Achievement Unlocked: Homeowner</span>
              </div>
            </div>
          </Card>

          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3">What's Next?</h2>
            <p className="text-gray-700 mb-4">
              Rida will review your offer and contact you within 24 hours to discuss next steps.
            </p>
            <p className="text-sm text-gray-600">
              You'll receive a call at the phone number you provided. Make sure to check your email for updates!
            </p>
          </div>

          <Button
            onClick={() => setLocation('/client/dashboard')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-8 py-3 text-lg"
          >
            View Your Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Make an Offer</h1>
                <p className="text-gray-600 mt-1">Step 8 of 8 • Final Step! 🎉</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Property Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-yellow-600" />
              Select Property
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose from saved properties
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select a property...</option>
                  {savedProperties.map((property) => (
                    <option key={property.zpid} value={property.zpid}>
                      {property.streetAddress} - {formatCurrency(property.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-sm text-gray-500">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter property address manually
                </label>
                <Input
                  type="text"
                  placeholder="123 Main St, Surrey, BC"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Offer Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Offer Details
            </h2>

            <div className="space-y-4">
              {/* Listing Price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Price
                  </label>
                  <Input
                    type="number"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer Price
                  </label>
                  <Input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => handleOfferPriceChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Offer Slider */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Offer Percentage</span>
                  <span className={`font-bold ${percentBelowListing > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {percentBelowListing}% below listing
                  </span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="5"
                  step="1"
                  value={-percentBelowListing}
                  onChange={(e) => {
                    const percent = -Number(e.target.value);
                    setOfferPrice(Math.round(listingPrice * (1 - percent / 100)));
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15% below</span>
                  <span>Listing</span>
                  <span>5% above</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Typical offers are 5-10% below listing in current market
                </p>
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subjects.financing}
                      onChange={(e) => setSubjects({ ...subjects, financing: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm">Subject to Financing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subjects.inspection}
                      onChange={(e) => setSubjects({ ...subjects, inspection: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm">Subject to Home Inspection</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subjects.saleOfProperty}
                      onChange={(e) => setSubjects({ ...subjects, saleOfProperty: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm">Subject to Sale of Current Property</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subjects.other}
                      onChange={(e) => setSubjects({ ...subjects, other: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm">Other</span>
                  </label>
                  {subjects.other && (
                    <Input
                      type="text"
                      placeholder="Specify other subject..."
                      value={otherSubject}
                      onChange={(e) => setOtherSubject(e.target.value)}
                      className="ml-6 w-full"
                    />
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Expiry
                  </label>
                  <Input
                    type="date"
                    value={offerExpiry}
                    onChange={(e) => setOfferExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Possession Date
                  </label>
                  <Input
                    type="date"
                    value={possessionDate}
                    onChange={(e) => setPossessionDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount
                  </label>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional terms or messages for the seller..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={() => setLocation('/milestone-dashboard')} disabled={isSubmitting}>
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !manualAddress || !offerPrice}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-8"
            >
              {isSubmitting ? 'Submitting...' : 'Send Offer to Rida for Review'}
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            This offer will be reviewed by Rida before being presented to the seller.
            <br />
            Rida will contact you within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Property Details Modal
 *
 * Displays detailed property information in a modal dialog
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { propertiesAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onScheduleViewing?: () => void;
}

export default function PropertyDetailsModal({
  isOpen,
  onClose,
  property,
  onScheduleViewing,
}: PropertyDetailsModalProps) {
  const { toast } = useToast();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && property?.zpid) {
      loadPropertyDetails();
    }
  }, [isOpen, property?.zpid]);

  const loadPropertyDetails = async () => {
    if (!property?.zpid) {
      setDetails(property);
      return;
    }

    setLoading(true);
    try {
      const response = await propertiesAPI.getDetails(property.zpid);
      if (response.success) {
        setDetails(response.data);
      } else {
        setDetails(property);
      }
    } catch (error) {
      console.error('Error loading property details:', error);
      setDetails(property);
    } finally {
      setLoading(false);
    }
  };

  const images = details?.photos || details?.carouselPhotos || [
    { url: details?.imgSrc || property?.imgSrc || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!property) return null;

  const displayProperty = details || property;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {displayProperty.streetAddress || displayProperty.address}
          </DialogTitle>
          <DialogDescription>
            {displayProperty.city && `${displayProperty.city}, `}
            {displayProperty.state} {displayProperty.zipcode}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]?.url || images[currentImageIndex]?.mixedSources?.jpeg?.[0]?.url || displayProperty.imgSrc}
                  alt="Property"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
                  }}
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Price and Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {displayProperty.price ? formatCurrency(displayProperty.price) : 'Contact for price'}
                </p>
              </div>
              {displayProperty.bedrooms !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-xl font-semibold">
                    <i className="fas fa-bed mr-2 text-gray-400"></i>
                    {displayProperty.bedrooms}
                  </p>
                </div>
              )}
              {displayProperty.bathrooms !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-xl font-semibold">
                    <i className="fas fa-bath mr-2 text-gray-400"></i>
                    {displayProperty.bathrooms}
                  </p>
                </div>
              )}
              {displayProperty.livingArea && (
                <div>
                  <p className="text-sm text-gray-600">Square Feet</p>
                  <p className="text-xl font-semibold">
                    <i className="fas fa-ruler-combined mr-2 text-gray-400"></i>
                    {displayProperty.livingArea.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Property Type and Status */}
            <div className="flex flex-wrap gap-2">
              {displayProperty.homeType && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {displayProperty.homeType}
                </span>
              )}
              {displayProperty.listingStatus && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {displayProperty.listingStatus}
                </span>
              )}
              {displayProperty.daysOnZillow !== undefined && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  {displayProperty.daysOnZillow} days on market
                </span>
              )}
            </div>

            {/* Description */}
            {displayProperty.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{displayProperty.description}</p>
              </div>
            )}

            {/* Additional Features */}
            {(displayProperty.yearBuilt || displayProperty.lotSize || displayProperty.parkingSpaces) && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Property Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {displayProperty.yearBuilt && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-gray-400"></i>
                      <div>
                        <p className="text-xs text-gray-600">Year Built</p>
                        <p className="font-medium">{displayProperty.yearBuilt}</p>
                      </div>
                    </div>
                  )}
                  {displayProperty.lotSize && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map text-gray-400"></i>
                      <div>
                        <p className="text-xs text-gray-600">Lot Size</p>
                        <p className="font-medium">{displayProperty.lotSize.toLocaleString()} sqft</p>
                      </div>
                    </div>
                  )}
                  {displayProperty.parkingSpaces && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-car text-gray-400"></i>
                      <div>
                        <p className="text-xs text-gray-600">Parking</p>
                        <p className="font-medium">{displayProperty.parkingSpaces} spaces</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={onScheduleViewing}
                className="flex-1"
              >
                <i className="fas fa-calendar-check mr-2"></i>
                Schedule Viewing
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

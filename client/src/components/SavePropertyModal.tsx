/**
 * Save Property Modal
 *
 * Modal for saving properties with phone verification
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { savedPropertiesAPI } from '@/lib/api';
import { z } from 'zod';

interface SavePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  propertyData: {
    zpid: string;
    streetAddress: string;
    city?: string;
    state?: string;
    zipcode?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    livingArea?: number;
    imgSrc?: string;
  };
}

const saveFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export default function SavePropertyModal({
  isOpen,
  onClose,
  onSuccess,
  propertyData,
}: SavePropertyModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form
      const validated = saveFormSchema.parse(formData);

      // Save the property
      await savedPropertiesAPI.save({
        phoneNumber: validated.phoneNumber,
        clientName: validated.name,
        zpid: propertyData.zpid,
        propertyData: {
          streetAddress: propertyData.streetAddress,
          city: propertyData.city,
          state: propertyData.state,
          zipcode: propertyData.zipcode,
          price: propertyData.price,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          livingArea: propertyData.livingArea,
          imgSrc: propertyData.imgSrc,
        },
      });

      toast({
        title: 'Property Saved!',
        description: 'This property has been added to your saved list. Log in to view all your saved properties.',
      });

      // Reset form
      setFormData({ name: '', phoneNumber: '' });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save property',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phoneNumber: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className="fas fa-heart text-red-500"></i>
            <span>Save This Property</span>
          </DialogTitle>
          <DialogDescription>
            Enter your details to save this property to your account. You can view all saved properties by logging into the client portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (234) 567-8900"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={loading}
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
            {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
            <p className="text-xs text-muted-foreground">
              Use E.164 format (e.g., +12345678900)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <i className="fas fa-info-circle mr-2"></i>
              Your information will be used to create an account where you can view all your saved properties and appointments.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-heart mr-2"></i>
                  Save Property
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

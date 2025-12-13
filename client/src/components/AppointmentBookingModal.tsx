/**
 * Appointment Booking Modal
 *
 * Modal for scheduling property viewings.
 * Creates appointments and auto-registers users if needed.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { appointmentsAPI } from '@/lib/api';

// Form schema
const appointmentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyAddress: string;
  propertyDetails?: {
    zpid?: string;
    price?: number | string;
    beds?: number;
    baths?: number;
  };
  onSuccess?: () => void;
}

export default function AppointmentBookingModal({
  isOpen,
  onClose,
  propertyAddress,
  propertyDetails,
  onSuccess,
}: AppointmentBookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);

    try {
      // Create appointment with user info
      const appointmentData = {
        propertyAddress,
        preferredDate: new Date(data.preferredDate).toISOString(),
        preferredTime: data.preferredTime,
        notes: data.notes || '',
        clientPhone: data.phoneNumber,
        clientName: data.name,
        ...(propertyDetails?.zpid && { zpid: propertyDetails.zpid }),
      };

      const response = await appointmentsAPI.create(appointmentData);

      if (response.success) {
        toast({
          title: 'Viewing Scheduled! 🎉',
          description: `Your appointment for ${propertyAddress} has been booked. We'll contact you at ${data.phoneNumber} to confirm.`,
        });

        reset();
        onClose();

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error: any) {
      console.error('Appointment booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to schedule appointment. Please try again or call us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Schedule a Viewing</DialogTitle>
          <DialogDescription>
            Book an appointment to view this property. We'll contact you to confirm the details.
          </DialogDescription>
        </DialogHeader>

        {/* Property Info */}
        <div className="bg-muted p-4 rounded-lg mb-2">
          <p className="font-semibold text-sm mb-1">Property:</p>
          <p className="text-sm">{propertyAddress}</p>
          {propertyDetails && (
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              {propertyDetails.beds && <span>{propertyDetails.beds} beds</span>}
              {propertyDetails.baths && <span>{propertyDetails.baths} baths</span>}
              {propertyDetails.price && (
                <span className="font-semibold text-foreground">
                  {typeof propertyDetails.price === 'number'
                    ? `$${propertyDetails.price.toLocaleString()}`
                    : propertyDetails.price}
                </span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (234) 567-8900"
              {...register('phoneNumber')}
              disabled={isSubmitting}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Date and Time in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date *</Label>
              <Input
                id="preferredDate"
                type="date"
                {...register('preferredDate')}
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.preferredDate && (
                <p className="text-sm text-destructive">{errors.preferredDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time *</Label>
              <Input
                id="preferredTime"
                type="time"
                {...register('preferredTime')}
                disabled={isSubmitting}
              />
              {errors.preferredTime && (
                <p className="text-sm text-destructive">{errors.preferredTime.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              {...register('notes')}
              disabled={isSubmitting}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any specific questions or requirements?"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Viewing'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By scheduling, you'll be registered in our system to track your appointments.
            We respect your privacy and will only contact you about this viewing.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

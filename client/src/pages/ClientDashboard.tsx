/**
 * Client Dashboard Page
 *
 * Client portal for viewing and managing their appointments
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { appointmentsAPI } from '../lib/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/useToast';

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    propertyAddress: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/client/login');
      return;
    }

    loadAppointments();
  }, [isAuthenticated]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data || []);
    } catch (error: any) {
      console.error('Load appointments error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert date and time to ISO string
      const dateTime = new Date(`${bookingForm.preferredDate}T${bookingForm.preferredTime}`);

      await appointmentsAPI.create({
        propertyAddress: bookingForm.propertyAddress,
        preferredDate: dateTime.toISOString(),
        preferredTime: bookingForm.preferredTime,
        notes: bookingForm.notes,
      });

      toast({
        title: 'Success!',
        description: 'Your appointment has been booked. We\'ll contact you shortly to confirm.',
      });

      setShowBookingModal(false);
      setBookingForm({
        propertyAddress: '',
        preferredDate: '',
        preferredTime: '',
        notes: '',
      });

      loadAppointments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to book appointment',
        variant: 'destructive',
      });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });

      toast({
        title: 'Cancelled',
        description: 'Your appointment has been cancelled',
      });

      loadAppointments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel appointment',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  const pastAppointments = appointments.filter(
    apt => apt.status === 'cancelled' || apt.status === 'completed'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your property viewings</p>
          </div>
          <Button onClick={() => setShowBookingModal(true)} size="lg">
            <i className="fas fa-plus mr-2"></i>
            Book Viewing
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled property viewings</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt: any) => (
                  <div key={apt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">{apt.propertyAddress}</h3>
                        <p className="text-gray-600 mt-1">
                          <i className="fas fa-calendar mr-2"></i>
                          {formatDate(apt.preferredDate)} at {apt.preferredTime}
                        </p>
                        {apt.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            <i className="fas fa-note-sticky mr-2"></i>
                            {apt.notes}
                          </p>
                        )}
                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status === 'pending' ? 'Pending Confirmation' : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </div>
                      {apt.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-calendar-xmark text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No upcoming appointments</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Your First Viewing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>Your appointment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastAppointments.map((apt: any) => (
                  <div key={apt.id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{apt.propertyAddress}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(apt.preferredDate)} at {apt.preferredTime}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Property Viewing</DialogTitle>
            <DialogDescription>
              Schedule an appointment to view a property
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                placeholder="123 Main St, Vancouver, BC"
                value={bookingForm.propertyAddress}
                onChange={e => setBookingForm({ ...bookingForm, propertyAddress: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={bookingForm.preferredDate}
                  onChange={e => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={bookingForm.preferredTime}
                  onChange={e => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any specific requirements..."
                value={bookingForm.notes}
                onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Book Appointment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

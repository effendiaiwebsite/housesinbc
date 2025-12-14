/**
 * Admin Appointments Page
 *
 * Professional appointment management with status tracking and filtering
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { appointmentsAPI } from '@/lib/api';

interface Appointment {
  id: string;
  userId: string;
  clientName: string;
  clientPhone: string;
  propertyAddress: string;
  preferredDate: Date | string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function AdminAppointments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'status'>('date-desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, searchQuery, statusFilter, sortBy]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentsAPI.getAll();

      if (response.success && response.data) {
        const appointmentsData = response.data.map((apt: any) => ({
          ...apt,
          preferredDate: apt.preferredDate?.toDate?.() || new Date(apt.preferredDate),
          createdAt: apt.createdAt?.toDate?.() || new Date(apt.createdAt),
          updatedAt: apt.updatedAt?.toDate?.() || new Date(apt.updatedAt),
        }));

        setAppointments(appointmentsData);
        calculateStats(appointmentsData);
      }
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentsData: Appointment[]) => {
    const stats = {
      total: appointmentsData.length,
      pending: appointmentsData.filter((a) => a.status === 'pending').length,
      confirmed: appointmentsData.filter((a) => a.status === 'confirmed').length,
      completed: appointmentsData.filter((a) => a.status === 'completed').length,
      cancelled: appointmentsData.filter((a) => a.status === 'cancelled').length,
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.clientName.toLowerCase().includes(query) ||
          apt.clientPhone.includes(query) ||
          apt.propertyAddress.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime();
        case 'date-asc':
          return new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      await appointmentsAPI.update(id, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Appointment marked as ${newStatus}`,
      });
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentsAPI.delete(id);
      toast({
        title: 'Appointment Deleted',
        description: 'Appointment has been removed',
      });
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete appointment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage property viewings</p>
            </div>
            <Button onClick={() => setLocation('/admin/dashboard')} className="w-full sm:w-auto">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.confirmed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name, phone, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredAppointments.length} of {stats.total} appointments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>Complete list of property viewing appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No appointments found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{apt.clientName}</div>
                            <div className="text-sm text-gray-500">{apt.clientPhone}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {apt.propertyAddress}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(apt.preferredDate)}</div>
                            <div className="text-sm text-gray-500">{apt.preferredTime}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Select
                              value={apt.status}
                              onValueChange={(value: any) => handleUpdateStatus(apt.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {apt.notes ? (
                              <div className="max-w-xs truncate">{apt.notes}</div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-gray-900">{apt.clientName}</div>
                          <div className="text-sm text-gray-600 mt-1">{apt.clientPhone}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="text-red-600 hover:text-red-900 -mt-1 -mr-2"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Property</div>
                          <div className="text-sm text-gray-900">{apt.propertyAddress}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Date</div>
                            <div className="text-sm text-gray-900">{formatDate(apt.preferredDate)}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Time</div>
                            <div className="text-sm text-gray-900">{apt.preferredTime}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Status</div>
                          <Select
                            value={apt.status}
                            onValueChange={(value: any) => handleUpdateStatus(apt.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {apt.notes && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Notes</div>
                            <div className="text-sm text-gray-600">{apt.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
        </main>
      </div>
    </div>
  );
}

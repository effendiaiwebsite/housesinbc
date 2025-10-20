/**
 * Admin Dashboard Page
 *
 * Main admin dashboard with analytics overview, recent leads, and quick actions
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI, leadsAPI, appointmentsAPI } from '../lib/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/useToast';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/admin/login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load analytics stats
      const statsResponse = await analyticsAPI.getStats();
      setStats(statsResponse.data);

      // Load appointments
      const appointmentsResponse = await appointmentsAPI.getAll();
      setAppointments(appointmentsResponse.data || []);

    } catch (error: any) {
      console.error('Dashboard load error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadsAPI.delete(id);
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Leads</CardDescription>
              <CardTitle className="text-3xl">
                {stats?.overview?.totalLeads || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">All time lead captures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Appointments</CardDescription>
              <CardTitle className="text-3xl">
                {stats?.overview?.totalAppointments || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Property viewings booked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conversion Rate</CardDescription>
              <CardTitle className="text-3xl">
                {stats?.overview?.conversionRate || '0%'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Leads to appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Subscribers</CardDescription>
              <CardTitle className="text-3xl">
                {stats?.overview?.totalSubscribers || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Newsletter subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Leads by Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
              <CardDescription>Where your leads are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.leadsBySource && Object.entries(stats.leadsBySource).map(([source, count]: [string, any]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{source}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
                {(!stats?.leadsBySource || Object.keys(stats.leadsBySource).length === 0) && (
                  <p className="text-sm text-gray-500">No leads yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointments by Status</CardTitle>
              <CardDescription>Current appointment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.appointmentsByStatus && Object.entries(stats.appointmentsByStatus).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
                {(!stats?.appointmentsByStatus || Object.keys(stats.appointmentsByStatus).length === 0) && (
                  <p className="text-sm text-gray-500">No appointments yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest lead captures from all sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentLeads?.map((lead: any) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{lead.name}</td>
                      <td className="py-3 px-4 text-sm">{lead.phoneNumber}</td>
                      <td className="py-3 px-4 text-sm">{lead.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm capitalize">{lead.source}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(lead.createdAt)}</td>
                      <td className="py-3 px-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentLeads || stats.recentLeads.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No leads yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Scheduled property viewings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-grow">
                    <p className="font-medium">{apt.propertyAddress}</p>
                    <p className="text-sm text-gray-600">{apt.clientName} - {apt.clientPhone}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(apt.preferredDate)} at {apt.preferredTime}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-center py-8 text-gray-500">No appointments scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

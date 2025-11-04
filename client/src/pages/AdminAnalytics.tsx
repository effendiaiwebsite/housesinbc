/**
 * Admin Analytics Page
 *
 * Comprehensive analytics dashboard with charts and insights
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { analyticsAPI, leadsAPI, appointmentsAPI } from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalLeads: number;
    totalAppointments: number;
    totalSubscribers: number;
    conversionRate: string;
  };
  leadsBySource: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  recentLeads: any[];
}

export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getStats();

      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      landing: 'fa-rocket',
      guide: 'fa-book',
      mortgage: 'fa-calculator',
      incentives: 'fa-gift',
      pricing: 'fa-tags',
      blog: 'fa-newspaper',
      properties: 'fa-home',
      calculator: 'fa-calculator',
    };
    return icons[source] || 'fa-circle';
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      landing: 'text-blue-600',
      guide: 'text-purple-600',
      mortgage: 'text-green-600',
      incentives: 'text-yellow-600',
      pricing: 'text-orange-600',
      blog: 'text-pink-600',
      properties: 'text-indigo-600',
      calculator: 'text-teal-600',
    };
    return colors[source] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">Failed to load analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights and metrics</p>
            </div>
            <Button onClick={() => setLocation('/admin/dashboard')}>
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {analytics.overview.totalLeads}
              </div>
              <p className="text-xs text-gray-500 mt-2">All time leads captured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analytics.overview.totalAppointments}
              </div>
              <p className="text-xs text-gray-500 mt-2">Property viewings scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {analytics.overview.conversionRate}
              </div>
              <p className="text-xs text-gray-500 mt-2">Leads to appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {analytics.overview.totalSubscribers}
              </div>
              <p className="text-xs text-gray-500 mt-2">Newsletter subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Leads by Source */}
          <Card>
            <CardHeader>
              <CardTitle>Leads by Source</CardTitle>
              <CardDescription>Distribution of lead capture points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.leadsBySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => {
                    const total = Object.values(analytics.leadsBySource).reduce(
                      (sum, val) => sum + val,
                      0
                    );
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

                    return (
                      <div key={source} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <i className={`fas ${getSourceIcon(source)} ${getSourceColor(source)}`}></i>
                            <span className="text-sm font-medium capitalize">{source}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{count}</span>
                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {Object.keys(analytics.leadsBySource).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-chart-bar text-4xl mb-2"></i>
                  <p>No lead data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments by Status</CardTitle>
              <CardDescription>Current status of all appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.appointmentsByStatus)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const total = Object.values(analytics.appointmentsByStatus).reduce(
                      (sum, val) => sum + val,
                      0
                    );
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

                    const statusColors: Record<string, string> = {
                      pending: 'bg-yellow-600',
                      confirmed: 'bg-blue-600',
                      completed: 'bg-green-600',
                      cancelled: 'bg-red-600',
                    };

                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{status}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{count}</span>
                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${
                              statusColors[status] || 'bg-gray-600'
                            } h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {Object.keys(analytics.appointmentsByStatus).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-calendar-times text-4xl mb-2"></i>
                  <p>No appointment data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lead Activity</CardTitle>
            <CardDescription>Latest lead captures across all sources</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentLeads && analytics.recentLeads.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentLeads.slice(0, 10).map((lead: any) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center`}
                      >
                        <i className={`fas ${getSourceIcon(lead.source)} ${getSourceColor(lead.source)}`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize text-gray-700">{lead.source}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p>No recent leads</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Lead Source</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(analytics.leadsBySource).length > 0 ? (
                <div>
                  <p className="text-2xl font-bold capitalize">
                    {
                      Object.entries(analytics.leadsBySource).sort(([, a], [, b]) => b - a)[0][0]
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Object.entries(analytics.leadsBySource).sort(([, a], [, b]) => b - a)[0][1]}{' '}
                    leads
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avg. Leads per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {analytics.overview.totalLeads > 0
                  ? Math.round(analytics.overview.totalLeads / 30)
                  : 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Last 30 days estimate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {analytics.appointmentsByStatus.pending || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Pending appointments</p>
            </CardContent>
          </Card>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}

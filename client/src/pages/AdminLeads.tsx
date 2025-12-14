/**
 * Admin Leads Page
 *
 * Professional CRM for managing all leads with filtering, sorting, and export
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
import { leadsAPI } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  source: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
}

export default function AdminLeads() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    bySource: {} as Record<string, number>,
  });

  // Load leads
  useEffect(() => {
    loadLeads();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [leads, searchQuery, sourceFilter, sortBy]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await leadsAPI.getAll();

      if (response.success && response.data) {
        const leadsData = response.data.map((lead: any) => ({
          ...lead,
          createdAt: lead.createdAt?.toDate?.() || new Date(lead.createdAt),
        }));

        setLeads(leadsData);
        calculateStats(leadsData);
      }
    } catch (error: any) {
      console.error('Failed to load leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadsData: Lead[]) => {
    const bySource: Record<string, number> = {};

    leadsData.forEach((lead) => {
      bySource[lead.source] = (bySource[lead.source] || 0) + 1;
    });

    setStats({
      total: leadsData.length,
      bySource,
    });
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.phoneNumber.includes(query) ||
          lead.email?.toLowerCase().includes(query)
      );
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.source === sourceFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredLeads(filtered);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Source', 'Created At', 'Metadata'];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.phoneNumber,
      lead.email || '',
      lead.source,
      new Date(lead.createdAt).toLocaleString(),
      JSON.stringify(lead.metadata || {}),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredLeads.length} leads to CSV`,
    });
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadsAPI.delete(id);
      toast({
        title: 'Lead Deleted',
        description: 'Lead has been removed',
      });
      loadLeads();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      landing: 'bg-blue-100 text-blue-800',
      guide: 'bg-purple-100 text-purple-800',
      mortgage: 'bg-green-100 text-green-800',
      incentives: 'bg-yellow-100 text-yellow-800',
      pricing: 'bg-orange-100 text-orange-800',
      blog: 'bg-pink-100 text-pink-800',
      properties: 'bg-indigo-100 text-indigo-800',
      calculator: 'bg-teal-100 text-teal-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and track all your leads</p>
            </div>
            <Button onClick={() => setLocation('/admin/dashboard')} className="w-full sm:w-auto">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </CardContent>
            </Card>

            {Object.entries(stats.bySource)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([source, count]) => (
                <Card key={source}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 capitalize">
                      {source}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{count}</div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:col-span-2"
              />

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="landing">Landing</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="mortgage">Mortgage</SelectItem>
                  <SelectItem value="incentives">Incentives</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="properties">Properties</SelectItem>
                  <SelectItem value="calculator">Calculator</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredLeads.length} of {stats.total} leads
              </p>
              <Button onClick={handleExportCSV} variant="outline">
                <i className="fas fa-download mr-2"></i>
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
            <CardDescription>Complete list of captured leads</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No leads found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metadata
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{lead.name}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{lead.phoneNumber}</div>
                            {lead.email && (
                              <div className="text-sm text-gray-500">{lead.email}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(
                                lead.source
                              )}`}
                            >
                              {lead.source}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(lead.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {lead.metadata && Object.keys(lead.metadata).length > 0 ? (
                              <div className="max-w-xs truncate">
                                {Object.entries(lead.metadata)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ')}
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead.id)}
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
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{lead.phoneNumber}</div>
                          {lead.email && (
                            <div className="text-sm text-gray-600">{lead.email}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-red-600 hover:text-red-900 -mt-1 -mr-2"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(
                            lead.source
                          )}`}
                        >
                          {lead.source}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 mb-2">
                        {formatDate(lead.createdAt)}
                      </div>

                      {lead.metadata && Object.keys(lead.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs font-medium text-gray-500 mb-2">Metadata</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {Object.entries(lead.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span className="text-gray-700">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

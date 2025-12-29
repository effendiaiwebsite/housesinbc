/**
 * Admin Registered Users Page
 *
 * Professional management interface for viewing and managing registered users
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
import { registeredUsersAPI } from '@/lib/api';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'client';
  verified: boolean;
  loginType: string;
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export default function AdminRegisteredUsers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    byRole: {} as Record<string, number>,
    byLoginType: {} as Record<string, number>,
  });

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, sortBy]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await registeredUsersAPI.getAll();

      if (response.success && response.data) {
        const usersData = response.data.map((user: any) => ({
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        }));

        setUsers(usersData);
        calculateStats(usersData);
      }
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registered users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData: RegisteredUser[]) => {
    const byRole: Record<string, number> = {};
    const byLoginType: Record<string, number> = {};

    usersData.forEach((user) => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
      byLoginType[user.loginType] = (byLoginType[user.loginType] || 0) + 1;
    });

    setStats({
      total: usersData.length,
      byRole,
      byLoginType,
    });
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phoneNumber?.includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Verified', 'Login Type', 'Last Login', 'Created At'];
    const rows = filteredUsers.map((user) => [
      user.name || '',
      user.email || '',
      user.phoneNumber || '',
      user.role,
      user.verified ? 'Yes' : 'No',
      user.loginType,
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      new Date(user.createdAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registered-users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredUsers.length} users to CSV`,
    });
  };

  const handleDeleteUser = async (id: string, userName: string, userRole: string) => {
    if (userRole === 'admin') {
      toast({
        title: 'Cannot Delete',
        description: 'Admin users cannot be deleted for security reasons',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

    try {
      await registeredUsersAPI.delete(id);
      toast({
        title: 'User Deleted',
        description: 'User has been removed successfully',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getLoginTypeBadgeColor = (loginType: string) => {
    const colors: Record<string, string> = {
      google: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      phone: 'bg-orange-100 text-orange-800',
      otp: 'bg-yellow-100 text-yellow-800',
    };
    return colors[loginType] || 'bg-gray-100 text-gray-800';
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registered Users</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage all registered user accounts</p>
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
                    <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.byRole.client || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{stats.byRole.admin || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Google Sign-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.byLoginType.google || 0}</div>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="md:col-span-2"
                  />

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
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
                    Showing {filteredUsers.length} of {stats.total} users
                  </p>
                  <Button onClick={handleExportCSV} variant="outline">
                    <i className="fas fa-download mr-2"></i>
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Registered Users</CardTitle>
                <CardDescription>Complete list of registered user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Login Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="font-medium text-gray-900">{user.name || 'No name'}</div>
                                    {user.verified && (
                                      <div className="text-xs text-green-600">
                                        <i className="fas fa-check-circle mr-1"></i>Verified
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                {user.email && (
                                  <div className="text-sm text-gray-900">{user.email}</div>
                                )}
                                {user.phoneNumber && (
                                  <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                    user.role
                                  )}`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getLoginTypeBadgeColor(
                                    user.loginType
                                  )}`}
                                >
                                  {user.loginType}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id, user.name || user.email, user.role)}
                                  className={`${
                                    user.role === 'admin'
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-red-600 hover:text-red-900'
                                  }`}
                                  disabled={user.role === 'admin'}
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
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-semibold text-base text-gray-900">
                                {user.name || 'No name'}
                                {user.verified && (
                                  <i className="fas fa-check-circle text-green-600 ml-2 text-sm"></i>
                                )}
                              </div>
                              {user.email && (
                                <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                              )}
                              {user.phoneNumber && (
                                <div className="text-sm text-gray-600">{user.phoneNumber}</div>
                              )}
                            </div>
                            {user.role !== 'admin' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id, user.name || user.email, user.role)}
                                className="text-red-600 hover:text-red-900 -mt-1 -mr-2"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getLoginTypeBadgeColor(
                                user.loginType
                              )}`}
                            >
                              {user.loginType}
                            </span>
                          </div>

                          <div className="text-sm text-gray-500 mb-1">
                            <strong>Last Login:</strong> {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                          </div>

                          <div className="text-sm text-gray-500">
                            <strong>Created:</strong> {formatDate(user.createdAt)}
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

/**
 * Admin Users Page - View all quiz responses and user journeys
 *
 * Phase 6: Task 6.1 - View user quiz responses
 * Phase 6: Task 6.2 - View milestone progress overview
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Users, Eye, TrendingUp, DollarSign, Home, Calendar,
  ChevronRight, Search, Filter, RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import AdminSidebar from '../components/AdminSidebar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

interface QuizResponse {
  id: string;
  userId: string;
  sessionId: string;
  income: number;
  savings: number;
  hasRRSP: boolean;
  propertyType: string;
  timeline: string;
  calculatedAffordability: number;
  calculatedIncentives: {
    ptt: number;
    gst: number;
    fhsa: number;
    total: number;
  };
  createdAt: Date;
}

interface UserProgress {
  id: string;
  userId: string;
  quizResponseId: string;
  overallProgress: number;
  milestones: any;
  updatedAt: Date;
}

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [progressData, setProgressData] = useState<Record<string, UserProgress>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress'>('newest');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/admin/login');
      return;
    }

    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all quiz responses
      const quizResponse = await fetch('/api/quiz/admin/all?limit=100', {
        credentials: 'include',
      });

      if (!quizResponse.ok) {
        throw new Error('Failed to load quiz responses');
      }

      const quizData = await quizResponse.json();
      setQuizResponses(quizData.data || []);

      // Load all progress data
      const progressResponse = await fetch('/api/progress/admin/all?limit=100', {
        credentials: 'include',
      });

      if (progressResponse.ok) {
        const progressJson = await progressResponse.json();
        const progressMap: Record<string, UserProgress> = {};

        (progressJson.data || []).forEach((prog: UserProgress) => {
          progressMap[prog.userId] = prog;
        });

        setProgressData(progressMap);
      }

    } catch (error: any) {
      console.error('Load data error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'condo': return '🏢';
      case 'townhome': return '🏘️';
      case 'detached': return '🏠';
      default: return '🏡';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-success';
    if (progress >= 50) return 'text-primary';
    if (progress >= 25) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getProgressBg = (progress: number) => {
    if (progress >= 75) return 'bg-success-light';
    if (progress >= 50) return 'bg-primary-light';
    if (progress >= 25) return 'bg-warning-light';
    return 'bg-secondary';
  };

  // Filter and sort users
  const filteredUsers = quizResponses
    .filter((quiz) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (quiz.userId && quiz.userId.toLowerCase().includes(searchLower)) ||
        (quiz.sessionId && quiz.sessionId.toLowerCase().includes(searchLower)) ||
        (quiz.propertyType && quiz.propertyType.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Property type filter
      if (filterProperty !== 'all' && quiz.propertyType !== filterProperty) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // Sort by progress
        const aProgress = progressData[a.userId || a.sessionId]?.overallProgress || 0;
        const bProgress = progressData[b.userId || b.sessionId]?.overallProgress || 0;
        return bProgress - aProgress;
      }
    });

  const stats = {
    totalUsers: quizResponses.length,
    avgAffordability: quizResponses.length > 0
      ? quizResponses.reduce((sum, q) => sum + q.calculatedAffordability, 0) / quizResponses.length
      : 0,
    avgProgress: Object.values(progressData).length > 0
      ? Object.values(progressData).reduce((sum, p) => sum + p.overallProgress, 0) / Object.values(progressData).length
      : 0,
    completed100: Object.values(progressData).filter(p => p.overallProgress === 100).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-white to-background">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 md:ml-64 transition-all duration-300 pb-20 md:pb-8">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  User Journeys
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  View quiz responses and track milestone progress
                </p>
              </div>
              <Button
                onClick={loadData}
                variant="outline"
                className="border-primary/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <Users className="w-10 h-10 text-primary" />
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>

              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-10 h-10 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Affordability</p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {formatCurrency(stats.avgAffordability)}
                  </p>
                </div>
              </div>

              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {stats.avgProgress.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <Home className="w-10 h-10 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Journey</p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {stats.completed100}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by user ID or property type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                  className="px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Properties</option>
                  <option value="condo">Condos</option>
                  <option value="townhome">Townhomes</option>
                  <option value="detached">Detached</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="progress">By Progress</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="premium-card p-4 sm:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">User</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Property</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Income</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Affordability</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Incentives</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Progress</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Created</th>
                    <th className="text-right py-4 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((quiz) => {
                    const progress = progressData[quiz.userId || quiz.sessionId];
                    const progressPercent = progress?.overallProgress || 0;

                    return (
                      <tr
                        key={quiz.id}
                        className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-sm">{quiz.userId || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {quiz.sessionId}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="flex items-center space-x-2">
                            <span className="text-lg">{getPropertyIcon(quiz.propertyType)}</span>
                            <span className="capitalize text-sm">{quiz.propertyType}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {formatCurrency(quiz.income)}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold">
                          {formatCurrency(quiz.calculatedAffordability)}
                        </td>
                        <td className="py-4 px-4 text-sm text-success">
                          {formatCurrency(quiz.calculatedIncentives.total)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  progressPercent >= 75 ? 'bg-success' :
                                  progressPercent >= 50 ? 'bg-primary' :
                                  progressPercent >= 25 ? 'bg-warning' :
                                  'bg-muted-foreground'
                                } transition-all duration-500`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-semibold ${getProgressColor(progressPercent)} min-w-[45px]`}>
                              {progressPercent.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(quiz.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/users/${quiz.userId || quiz.sessionId}`)}
                            className="text-primary hover:bg-primary-light"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map((quiz) => {
                  const progress = progressData[quiz.userId || quiz.sessionId];
                  const progressPercent = progress?.overallProgress || 0;

                  return (
                    <div key={quiz.id} className="bg-white border border-border rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-foreground">{quiz.userId || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">{quiz.sessionId}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/admin/users/${quiz.userId || quiz.sessionId}`)}
                          className="text-primary hover:bg-primary-light"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Property</span>
                          <span className="flex items-center space-x-2">
                            <span className="text-lg">{getPropertyIcon(quiz.propertyType)}</span>
                            <span className="capitalize text-sm">{quiz.propertyType}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Income</div>
                            <div className="text-sm font-medium">{formatCurrency(quiz.income)}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Affordability</div>
                            <div className="text-sm font-semibold">{formatCurrency(quiz.calculatedAffordability)}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Incentives</div>
                          <div className="text-sm font-medium text-success">{formatCurrency(quiz.calculatedIncentives.total)}</div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">Progress</div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  progressPercent >= 75 ? 'bg-success' :
                                  progressPercent >= 50 ? 'bg-primary' :
                                  progressPercent >= 25 ? 'bg-warning' :
                                  'bg-muted-foreground'
                                } transition-all duration-500`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-semibold ${getProgressColor(progressPercent)} min-w-[45px]`}>
                              {progressPercent.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                          Created {formatDate(quiz.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

/**
 * Admin Dashboard - Premium Design
 *
 * World-class admin dashboard with analytics, leads, insights, and left sidebar navigation
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Users, Calendar, TrendingUp, MessageSquare, Phone, Mail,
  Trash2, Eye, ArrowUpRight, Clock, CheckCircle, XCircle,
  BarChart3, Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI, leadsAPI, appointmentsAPI } from '../lib/api';
import Navigation from '../components/Navigation';
import AdminSidebar from '../components/AdminSidebar';
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
  const [chatSessions, setChatSessions] = useState<any[]>([]);

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

      // Load recent chat sessions
      try {
        const chatsResponse = await fetch('/api/chatbot/admin/chats?limit=5', {
          credentials: 'include',
        });
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json();
          setChatSessions(chatsData.sessions || []);
        }
      } catch (chatError) {
        console.error('Failed to load chat sessions:', chatError);
        // Don't fail the whole dashboard if chats fail
      }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-premium">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.overview?.totalLeads || 0,
      description: 'All time lead captures',
      icon: Users,
      gradient: 'gradient-primary',
      bgLight: 'bg-primary-light',
      textColor: 'text-primary',
      trend: '+12%',
    },
    {
      title: 'Appointments',
      value: stats?.overview?.totalAppointments || 0,
      description: 'Property viewings booked',
      icon: Calendar,
      gradient: 'gradient-success',
      bgLight: 'bg-success-light',
      textColor: 'text-success',
      trend: '+8%',
    },
    {
      title: 'Conversion Rate',
      value: stats?.overview?.conversionRate || '0%',
      description: 'Leads to appointments',
      icon: TrendingUp,
      gradient: 'gradient-warning',
      bgLight: 'bg-warning-light',
      textColor: 'text-warning',
      trend: '+5%',
    },
    {
      title: 'Chat Sessions',
      value: chatSessions.length,
      description: 'Active conversations',
      icon: MessageSquare,
      gradient: 'gradient-info',
      bgLight: 'bg-info-light',
      textColor: 'text-info',
      clickable: true,
      onClick: () => setLocation('/admin/chatbot'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-white to-background">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 md:ml-64 transition-all duration-300 pb-20 md:pb-8">
          {/* Header - Premium */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back! Here's your business overview.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/analytics')}
                className="border-primary/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                onClick={() => setLocation('/admin/leads')}
                className="gradient-primary text-white shadow-premium"
              >
                <Users className="w-4 h-4 mr-2" />
                View All Leads
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Premium */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`premium-card p-6 space-y-4 animate-fade-in-up ${stat.clickable ? 'cursor-pointer hover-lift' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between">
                  <div className={`icon-badge ${stat.gradient} text-white shadow-premium`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center space-x-1 ${stat.textColor} text-sm font-semibold`}>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section - Premium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="premium-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">Leads by Source</h3>
                <p className="text-sm text-muted-foreground">Where your leads are coming from</p>
              </div>
              <div className="icon-badge-sm gradient-primary text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-4">
              {stats?.leadsBySource && Object.entries(stats.leadsBySource).map(([source, count]: [string, any], index) => {
                const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-danger'];
                const total = Object.values(stats.leadsBySource).reduce((a: any, b: any) => a + b, 0) as number;
                const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

                return (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{source}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(!stats?.leadsBySource || Object.keys(stats.leadsBySource).length === 0) && (
                <p className="text-center py-8 text-muted-foreground">No leads yet</p>
              )}
            </div>
          </div>

          <div className="premium-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">Appointment Status</h3>
                <p className="text-sm text-muted-foreground">Current appointment breakdown</p>
              </div>
              <div className="icon-badge-sm gradient-success text-white">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3">
              {stats?.appointmentsByStatus && Object.entries(stats.appointmentsByStatus).map(([status, count]: [string, any]) => {
                const statusConfig: any = {
                  confirmed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success-light' },
                  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning-light' },
                  completed: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary-light' },
                  cancelled: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-light' },
                };
                const config = statusConfig[status] || { icon: Calendar, color: 'text-muted-foreground', bg: 'bg-secondary' };
                const Icon = config.icon;

                return (
                  <div key={status} className={`flex items-center justify-between p-4 ${config.bg} rounded-xl`}>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="font-medium capitalize">{status}</span>
                    </div>
                    <span className="text-2xl font-display font-bold text-foreground">{count}</span>
                  </div>
                );
              })}
              {(!stats?.appointmentsByStatus || Object.keys(stats.appointmentsByStatus).length === 0) && (
                <p className="text-center py-8 text-muted-foreground">No appointments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Leads - Premium Table */}
        <div className="premium-card p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground">Recent Leads</h3>
              <p className="text-sm text-muted-foreground">Latest lead captures from all sources</p>
            </div>
            <Button
              onClick={() => setLocation('/admin/leads')}
              variant="outline"
              className="border-primary/20"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Source</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                  <th className="text-right py-4 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentLeads?.map((lead: any, index: number) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{lead.phoneNumber}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1.5 bg-primary-light text-primary text-xs font-medium rounded-full capitalize">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-danger hover:bg-danger-light hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentLeads || stats.recentLeads.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No leads yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments - Premium Cards */}
        <div className="premium-card p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground">Upcoming Appointments</h3>
              <p className="text-sm text-muted-foreground">Scheduled property viewings</p>
            </div>
            <Button
              onClick={() => setLocation('/admin/appointments')}
              variant="outline"
              className="border-primary/20"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-4">
            {appointments.slice(0, 5).map((apt: any, index: number) => {
              const statusConfig: any = {
                confirmed: { color: 'text-success', bg: 'bg-success-light', icon: CheckCircle },
                pending: { color: 'text-warning', bg: 'bg-warning-light', icon: Clock },
                completed: { color: 'text-primary', bg: 'bg-primary-light', icon: CheckCircle },
                cancelled: { color: 'text-danger', bg: 'bg-danger-light', icon: XCircle },
              };
              const config = statusConfig[apt.status] || { color: 'text-muted-foreground', bg: 'bg-secondary', icon: Calendar };
              const StatusIcon = config.icon;

              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-5 border border-border rounded-xl hover:shadow-soft hover-lift transition-all animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4 flex-grow">
                    <div className={`icon-badge ${apt.status === 'confirmed' ? 'gradient-success' : apt.status === 'pending' ? 'gradient-warning' : 'gradient-primary'} text-white`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-foreground mb-1">{apt.propertyAddress}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{apt.clientName}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(apt.preferredDate)} at {apt.preferredTime}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center space-x-2 px-4 py-2 ${config.bg} rounded-xl`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-semibold ${config.color} capitalize`}>{apt.status}</span>
                  </span>
                </div>
              );
            })}
            {appointments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Chatbot Conversations - Premium */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground">Chat Conversations</h3>
              <p className="text-sm text-muted-foreground">Latest customer interactions</p>
            </div>
            <Button
              onClick={() => setLocation('/admin/chatbot')}
              className="gradient-primary text-white shadow-premium"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {chatSessions.map((chat: any, index: number) => (
              <div
                key={chat.id}
                className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary/50 hover-lift transition-all cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setLocation('/admin/chatbot')}
              >
                <div className="flex items-center space-x-4 flex-grow">
                  <div className="w-12 h-12 rounded-full bg-gradient-info flex items-center justify-center text-white font-semibold">
                    {(chat.userPhone || chat.userId || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-foreground mb-1">{chat.userPhone || chat.userId || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{chat.lastMessage || 'No messages yet'}</p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{chat.messageCount} messages</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(chat.updatedAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {chatSessions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No chat conversations yet</p>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

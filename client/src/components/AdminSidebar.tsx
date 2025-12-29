/**
 * Admin Sidebar - Premium Navigation
 *
 * Left sidebar navigation for admin dashboard
 */

import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export default function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'User Journeys',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Registered Users',
      href: '/admin/registered-users',
      icon: Users,
    },
    {
      label: 'Offers',
      href: '/admin/offers',
      icon: FileText,
    },
    {
      label: 'Leads',
      href: '/admin/leads',
      icon: Users,
    },
    {
      label: 'Appointments',
      href: '/admin/appointments',
      icon: Calendar,
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      label: 'Chatbot',
      href: '/admin/chatbot',
      icon: MessageSquare,
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const isActive = (href: string) => location === href;

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-border flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors shadow-soft"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                active
                  ? 'bg-gradient-primary text-white shadow-premium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
              {!collapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 bg-danger text-white text-xs font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={() => setLocation('/')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-primary transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Home' : ''}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left font-medium">Home</span>}
        </button>

        <button
          onClick={() => setLocation('/admin/settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-primary transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Settings' : ''}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left font-medium">Settings</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-danger hover:bg-danger-light transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

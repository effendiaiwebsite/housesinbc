/**
 * Main App Component
 *
 * Sets up routing and global components.
 */

import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatWidget from '@/components/ChatWidget';

// Auth pages
import AdminLogin from '@/pages/AdminLogin';
import ClientLogin from '@/pages/ClientLogin';

// Public pages
import Home from '@/pages/Home';
import Landing from '@/pages/Landing';
import Pricing from '@/pages/Pricing';
import Mortgage from '@/pages/Mortgage';
import Incentives from '@/pages/Incentives';
import Blog from '@/pages/Blog';
import Properties from '@/pages/Properties';
import Neighborhoods from '@/pages/Neighborhoods';

// Admin pages
import Dashboard from '@/pages/Dashboard';
import AdminLeads from '@/pages/AdminLeads';
import AdminAppointments from '@/pages/AdminAppointments';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminChatbot from '@/pages/AdminChatbot';
import AdminChatDetail from '@/pages/AdminChatDetail';

// Client pages
import ClientDashboard from '@/pages/ClientDashboard';

function App() {
  return (
    <>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/landing" component={Landing} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/mortgage" component={Mortgage} />
        <Route path="/incentives" component={Incentives} />
        <Route path="/blog" component={Blog} />
        <Route path="/properties" component={Properties} />
        <Route path="/neighborhoods" component={Neighborhoods} />

        {/* Auth Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/client/login" component={ClientLogin} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard">
          <ProtectedRoute requireRole="admin">
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/leads">
          <ProtectedRoute requireRole="admin">
            <AdminLeads />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/appointments">
          <ProtectedRoute requireRole="admin">
            <AdminAppointments />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/analytics">
          <ProtectedRoute requireRole="admin">
            <AdminAnalytics />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/chatbot">
          <ProtectedRoute requireRole="admin">
            <AdminChatbot />
          </ProtectedRoute>
        </Route>

        <Route path="/admin/chatbot/chat/:sessionId">
          <ProtectedRoute requireRole="admin">
            <AdminChatDetail />
          </ProtectedRoute>
        </Route>

        {/* Protected Client Routes */}
        <Route path="/client/dashboard">
          <ProtectedRoute requireRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        </Route>

        {/* 404 */}
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <a
                href="/"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Home
              </a>
            </div>
          </div>
        </Route>
      </Switch>

      <Toaster />
      <ChatWidget />
    </>
  );
}

export default App;

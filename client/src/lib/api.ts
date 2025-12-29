/**
 * API Client
 *
 * Centralized API communication functions.
 */

// Base API configuration
const API_BASE_URL = '/api';

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Include cookies for session
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
}

// ===== Authentication API =====

export const authAPI = {
  // Firebase Google Sign-In
  googleSignIn: async (idToken: string, email: string, name: string | null, loginType: 'admin' | 'client' = 'client') => {
    console.log('🌐 API - googleSignIn request:');
    console.log('  URL: /auth/google-signin');
    console.log('  loginType:', loginType);
    const response = await apiRequest<{
      success: boolean;
      message: string;
      user: { id: string; email: string; phoneNumber?: string; role: 'admin' | 'client'; name?: string };
    }>('/auth/google-signin', {
      method: 'POST',
      body: JSON.stringify({ idToken, email, name, loginType }),
    });
    console.log('  Response:', response);
    return response;
  },

  // Firebase Email/Password Sign-In
  emailSignIn: async (idToken: string, email: string, loginType: 'admin' | 'client' = 'client') => {
    console.log('🌐 API - emailSignIn request:');
    console.log('  URL: /auth/email-signin');
    console.log('  email:', email);
    console.log('  loginType:', loginType);
    const response = await apiRequest<{
      success: boolean;
      message: string;
      user: { id: string; email: string; phoneNumber?: string; role: 'admin' | 'client'; name?: string };
    }>('/auth/email-signin', {
      method: 'POST',
      body: JSON.stringify({ idToken, email, loginType }),
    });
    console.log('  Response:', response);
    return response;
  },

  // Firebase Email/Password Sign-Up
  emailSignUp: async (idToken: string, email: string, name: string | undefined, loginType: 'admin' | 'client' = 'client') => {
    console.log('🌐 API - emailSignUp request:');
    console.log('  URL: /auth/email-signup');
    console.log('  email:', email);
    console.log('  loginType:', loginType);
    const response = await apiRequest<{
      success: boolean;
      message: string;
      user: { id: string; email: string; phoneNumber?: string; role: 'admin' | 'client'; name?: string };
    }>('/auth/email-signup', {
      method: 'POST',
      body: JSON.stringify({ idToken, email, name, loginType }),
    });
    console.log('  Response:', response);
    return response;
  },

  checkStatus: async () => {
    return apiRequest<{
      authenticated: boolean;
      user?: { id: string; email?: string; phoneNumber?: string; role: 'admin' | 'client'; name?: string };
    }>('/auth/status');
  },

  logout: async () => {
    return apiRequest<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};

// ===== Leads API =====

export const leadsAPI = {
  create: async (leadData: {
    name: string;
    phoneNumber: string;
    email?: string;
    source: string;
    metadata?: Record<string, any>;
  }) => {
    return apiRequest<{ success: boolean; id: string }>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  getAll: async () => {
    return apiRequest<{ leads: any[] }>('/leads');
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Appointments API =====

export const appointmentsAPI = {
  create: async (appointmentData: {
    propertyAddress: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
    clientPhone?: string;
    clientName?: string;
  }) => {
    return apiRequest<{ success: boolean; id: string; message: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  getAll: async () => {
    return apiRequest<{ success: boolean; data: any[] }>('/appointments');
  },

  getById: async (id: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/appointments/${id}`);
  },

  update: async (id: string, updates: {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
    adminNotes?: string;
  }) => {
    return apiRequest<{ success: boolean; message: string }>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Webinar API =====

export const webinarAPI = {
  signup: async (signupData: {
    name: string;
    email: string;
    phoneNumber: string;
    webinarDate: string;
  }) => {
    return apiRequest<{ success: boolean; id: string }>('/webinar-signups', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  },

  getAll: async () => {
    return apiRequest<{ signups: any[] }>('/webinar-signups');
  },
};

// ===== Newsletter API =====

export const newsletterAPI = {
  subscribe: async (email: string, name?: string, source?: string) => {
    return apiRequest<{ success: boolean; id: string }>('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email, name, source }),
    });
  },

  getAll: async () => {
    return apiRequest<{ subscribers: any[] }>('/newsletter');
  },

  unsubscribe: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/newsletter/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Blog API =====

export const blogAPI = {
  create: async (blogData: any) => {
    return apiRequest<{ success: boolean; id: string }>('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  getAll: async () => {
    return apiRequest<{ blogs: any[] }>('/blogs');
  },

  getById: async (id: string) => {
    return apiRequest<{ blog: any }>(`/blogs/${id}`);
  },

  update: async (id: string, blogData: any) => {
    return apiRequest<{ success: boolean }>(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Analytics API =====

export const analyticsAPI = {
  getStats: async () => {
    return apiRequest<{
      success: boolean;
      data: {
        overview: {
          totalLeads: number;
          totalAppointments: number;
          totalSubscribers: number;
          conversionRate: string;
        };
        leadsBySource: Record<string, number>;
        appointmentsByStatus: Record<string, number>;
        recentLeads: any[];
      };
    }>('/analytics/stats');
  },

  getLeadsTrend: async () => {
    return apiRequest<{
      success: boolean;
      data: Array<{ date: string; count: number }>;
    }>('/analytics/leads-trend');
  },
};

// ===== Properties API =====

export const propertiesAPI = {
  search: async (params: {
    location?: string;
    status_type?: 'ForSale' | 'ForRent' | 'RecentlySold';
    home_type?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    baths?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return apiRequest<{
      success: boolean;
      data: any;
    }>(`/properties/search?${queryParams.toString()}`);
  },

  getDetails: async (zpid: string) => {
    return apiRequest<{
      success: boolean;
      data: any;
    }>(`/properties/${zpid}`);
  },
};

// ===== Neighborhoods API =====

export const neighborhoodsAPI = {
  getAll: async () => {
    return apiRequest<{
      success: boolean;
      data: any[];
    }>('/neighborhoods');
  },

  getByLocation: async (location: string) => {
    return apiRequest<{
      success: boolean;
      data: any;
    }>(`/neighborhoods/${encodeURIComponent(location)}`);
  },
};

// ===== Saved Properties API =====

export const savedPropertiesAPI = {
  save: async (data: {
    phoneNumber: string;
    clientName: string;
    zpid: string;
    propertyData: {
      streetAddress: string;
      city?: string;
      state?: string;
      zipcode?: string;
      price?: number;
      bedrooms?: number;
      bathrooms?: number;
      livingArea?: number;
      imgSrc?: string;
    };
  }) => {
    return apiRequest<{ success: boolean; id: string; message: string }>('/saved-properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (phoneNumber?: string) => {
    const queryParams = phoneNumber ? `?phoneNumber=${encodeURIComponent(phoneNumber)}` : '';
    return apiRequest<{ success: boolean; data: any[] }>(`/saved-properties${queryParams}`);
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/saved-properties/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Registered Users API (Admin) =====

export const registeredUsersAPI = {
  getAll: async (role?: 'admin' | 'client') => {
    const queryParams = role ? `?role=${role}` : '';
    return apiRequest<{ success: boolean; data: any[]; total: number }>(`/admin/users${queryParams}`);
  },

  delete: async (id: string) => {
    return apiRequest<{ success: boolean; message: string; deletedUserId: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  leads: leadsAPI,
  appointments: appointmentsAPI,
  webinar: webinarAPI,
  newsletter: newsletterAPI,
  blog: blogAPI,
  analytics: analyticsAPI,
  properties: propertiesAPI,
  neighborhoods: neighborhoodsAPI,
  savedProperties: savedPropertiesAPI,
  registeredUsers: registeredUsersAPI,
};

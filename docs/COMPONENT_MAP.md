# Component Map

Complete reference of all components and their locations.

---

## UI Components (Shadcn/Radix)

Located in: `client/src/components/ui/`

| Component | File | Purpose |
|-----------|------|---------|
| Button | button.tsx | Button with variants (default, outline, ghost, etc.) |
| Input | input.tsx | Text input field |
| Label | label.tsx | Form label |
| Card | card.tsx | Card container with header, content, footer |
| Dialog | dialog.tsx | Modal dialog overlay |
| Toast | toast.tsx | Toast notification system |
| Toaster | toaster.tsx | Toast container/provider |

### Usage Example:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

---

## Shared Components

Located in: `client/src/components/`

### Navigation.tsx
**Purpose:** Main site header with responsive menu

**Props:** None

**Features:**
- Logo and brand
- Desktop navigation links
- Mobile hamburger menu
- Authentication state display
- Login/Logout buttons

**Usage:**
```tsx
import Navigation from '@/components/Navigation';

<Navigation />
```

---

### Footer.tsx
**Purpose:** Site footer with links and contact info

**Props:** None

**Features:**
- About section
- Quick links
- Resources
- Contact information
- Social media links

**Usage:**
```tsx
import Footer from '@/components/Footer';

<Footer />
```

---

### LeadCaptureModal.tsx
**Purpose:** Universal lead capture modal used across all pages

**Props:**
```tsx
interface LeadCaptureModalProps {
  isOpen: boolean;              // Modal visibility state
  onClose: () => void;          // Close handler
  source: 'landing' | 'mortgage' | 'incentives' | 'pricing' | 'blog' | 'properties' | 'calculator';
  metadata?: Record<string, any>;  // Optional context data
  onSuccess?: () => void;       // Success callback
}
```

**Features:**
- Title: "Verify you're a real person"
- Captures: Name, Phone, Email (optional)
- Form validation with Zod
- Toast notifications
- API integration

**Usage:**
```tsx
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';

function MyPage() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();

  const handleAction = () => {
    trigger('mortgage', { homePrice: 500000 });
  };

  return (
    <>
      <button onClick={handleAction}>Calculate</button>

      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={close}
        source={source}
        metadata={metadata}
        onSuccess={onSuccess}
      />
    </>
  );
}
```

---

### ProtectedRoute.tsx
**Purpose:** Route wrapper for authenticated pages

**Props:**
```tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'client';
}
```

**Features:**
- Checks authentication status
- Redirects to login if not authenticated
- Role-based access control
- Loading state during auth check

**Usage:**
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<Route path="/admin/dashboard">
  <ProtectedRoute requireRole="admin">
    <Dashboard />
  </ProtectedRoute>
</Route>
```

---

## Pages

Located in: `client/src/pages/`

### Public Pages

| Page | File | Route | Purpose |
|------|------|-------|---------|
| Home | Home.tsx | `/` | Landing page with hero and features |
| Landing | Landing.tsx | `/landing` | Lead magnet with guide download |
| Mortgage | Mortgage.tsx | `/mortgage` | Interactive mortgage calculator |
| Incentives | Incentives.tsx | `/incentives` | Government programs info |
| Pricing | Pricing.tsx | `/pricing` | Neighborhood explorer |
| Properties | Properties.tsx | `/properties` | Property search listings |
| Blog | Blog.tsx | `/blog` | Blog post listing |

### Auth Pages

| Page | File | Route | Purpose |
|------|------|-------|---------|
| Admin Login | AdminLogin.tsx | `/admin/login` | Admin OTP authentication |
| Client Login | ClientLogin.tsx | `/client/login` | Client OTP authentication |

### Protected Pages (Placeholders for Phase 5-6)

| Page | File | Route | Access |
|------|------|-------|--------|
| Admin Dashboard | TBD | `/admin/dashboard` | Admin only |
| Client Dashboard | TBD | `/client/dashboard` | Client only |

---

## Hooks

Located in: `client/src/hooks/`

### useAuth.ts
**Purpose:** Authentication state and operations

**Exports:**
- `AuthProvider` - Context provider component
- `useAuth()` - Hook for accessing auth state

**Returns:**
```tsx
{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

**Usage:**
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome {user?.phoneNumber}</div>;
  }

  return <div>Please log in</div>;
}
```

---

### useLeadCapture.ts
**Purpose:** Lead capture modal management

**Returns:**
```tsx
{
  isModalOpen: boolean;
  source: string;
  metadata?: Record<string, any>;
  trigger: (source, metadata?) => void;
  close: () => void;
  onSuccess: () => void;
  hasCapture: boolean;
}
```

**Features:**
- Session-based duplicate prevention (24 hours)
- LocalStorage tracking
- Automatic modal management

**Usage:**
```tsx
import { useLeadCapture } from '@/hooks/useLeadCapture';

const { trigger, isModalOpen, close, onSuccess } = useLeadCapture();

// Trigger modal
trigger('mortgage', { homePrice: 500000 });
```

---

### useToast.ts
**Purpose:** Toast notification system

**Returns:**
```tsx
{
  toasts: Array<Toast>;
  toast: (props: Toast) => void;
  dismiss: (toastId?: string) => void;
}
```

**Usage:**
```tsx
import { useToast } from '@/hooks/useToast';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Operation completed',
  variant: 'default' | 'destructive'
});
```

---

## Utilities

Located in: `client/src/lib/`

### utils.ts
Helper functions:
- `cn()` - Merge Tailwind classes
- `formatPhoneNumber()` - Format phone for display
- `formatDate()` - Format date for display
- `formatCurrency()` - Format currency values
- `debounce()` - Debounce function calls
- `sleep()` - Async delay
- `generateId()` - Random ID generation

### api.ts
API client with type-safe endpoints:
- `authAPI` - Authentication endpoints
- `leadsAPI` - Lead management
- `appointmentsAPI` - Appointment CRUD
- `webinarAPI` - Webinar signups
- `newsletterAPI` - Newsletter management
- `blogAPI` - Blog CRUD
- `analyticsAPI` - Dashboard stats

**Usage:**
```tsx
import { leadsAPI } from '@/lib/api';

// Create lead
await leadsAPI.create({
  name: 'John Doe',
  phoneNumber: '+1234567890',
  source: 'mortgage',
});

// Get all leads (admin)
const { leads } = await leadsAPI.getAll();
```

---

## Server Components

Located in: `server/`

### Middleware (middleware.ts)
- `requireAuth` - Check authentication
- `requireAdmin` - Check admin role
- `validateBody` - Zod validation
- `errorHandler` - Global error handling
- `requestLogger` - Request logging

### Routes
- `server/routes/auth.ts` - Authentication endpoints
- `server/routes/leads.ts` - Lead management endpoints

### Services
- `server/db.ts` - Firestore connection and collections
- `server/sms.ts` - Twilio SMS service
- `server/index.ts` - Express server setup

---

## Context Providers

Wrap your app with these providers (already set up in `main.tsx`):

```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <App />
  </AuthProvider>
</QueryClientProvider>
```

---

## Styling

### Tailwind Configuration
- Located in: `tailwind.config.js`
- CSS variables defined in: `client/src/index.css`
- Uses Shadcn color system

### Common Patterns
```tsx
// Button variants
<Button variant="default" />  // Primary blue
<Button variant="outline" />  // Border only
<Button variant="ghost" />    // Transparent
<Button variant="secondary" /> // Gray

// Card layout
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {items.map(...)}
</div>
```

---

## File Structure Summary

```
client/src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── Navigation.tsx   # Header
│   ├── Footer.tsx       # Footer
│   ├── LeadCaptureModal.tsx
│   └── ProtectedRoute.tsx
├── pages/               # Page components
├── hooks/               # Custom hooks
├── lib/                 # Utilities and API client
├── App.tsx             # Main router
└── main.tsx            # Entry point

server/
├── routes/             # API routes
├── middleware.ts       # Express middleware
├── db.ts              # Firestore config
├── sms.ts             # Twilio SMS
└── index.ts           # Server entry

shared/
└── schema.ts          # Zod schemas & types
```

---

**Last Updated:** Phase 4 Complete

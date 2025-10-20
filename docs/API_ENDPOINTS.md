# API Endpoints Reference

Base URL: `/api`

---

## Authentication Endpoints

### POST /api/auth/send-otp
Send OTP code to phone number for authentication.

**Access:** Public

**Request Body:**
```json
{
  "phoneNumber": "+12345678900"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

---

### POST /api/auth/verify-otp
Verify OTP code and create session.

**Access:** Public

**Request Body:**
```json
{
  "phoneNumber": "+12345678900",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "user123",
    "phoneNumber": "+12345678900",
    "role": "admin" | "client"
  }
}
```

---

### GET /api/auth/status
Check current authentication status.

**Access:** Public

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "user123",
    "phoneNumber": "+12345678900",
    "role": "admin"
  }
}
```

---

### POST /api/auth/logout
Destroy session and logout.

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Lead Endpoints

### POST /api/leads
Create a new lead (lead capture).

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "phoneNumber": "+12345678900",
  "email": "john@example.com",
  "source": "mortgage",
  "metadata": {
    "homePrice": 500000,
    "downPayment": 20
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "lead123",
  "message": "Lead captured successfully"
}
```

---

### GET /api/leads
Get all leads with pagination.

**Access:** Admin only

**Query Parameters:**
- `source` (optional): Filter by source
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "leads": [
    {
      "id": "lead123",
      "name": "John Doe",
      "phoneNumber": "+12345678900",
      "email": "john@example.com",
      "source": "mortgage",
      "metadata": {},
      "createdAt": "2025-01-20T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

---

### GET /api/leads/:id
Get a single lead by ID.

**Access:** Admin only

**Response:**
```json
{
  "lead": {
    "id": "lead123",
    "name": "John Doe",
    ...
  }
}
```

---

### DELETE /api/leads/:id
Delete a lead.

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

### GET /api/leads/stats/by-source
Get lead counts by source.

**Access:** Admin only

**Response:**
```json
{
  "stats": [
    { "source": "landing", "count": 45 },
    { "source": "mortgage", "count": 32 },
    { "source": "incentives", "count": 28 }
  ]
}
```

---

## Health Check

### GET /api/health
Check API health status.

**Access:** Public

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00Z",
  "environment": "development"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## Upcoming Endpoints (Phase 5-7)

These endpoints will be added in subsequent phases:

- `GET /api/appointments` - Get all appointments (admin)
- `POST /api/appointments` - Create appointment (client)
- `GET /api/client/appointments` - Get client's appointments
- `PUT /api/admin/appointments/:id` - Update appointment status
- `GET /api/blogs` - Get all blog posts
- `POST /api/blogs` - Create blog post (admin)
- `GET /api/analytics/stats` - Get dashboard statistics (admin)
- `POST /api/newsletter` - Subscribe to newsletter
- `POST /api/webinar-signups` - Sign up for webinar

---

**Last Updated:** Phase 4 Complete

# Firestore Database Schema

## Collections Overview

This document describes all Firestore collections and their structure.

---

## Collections

### 1. **leads**
Stores all lead captures from various sources across the website.

**Fields:**
- `id` (string) - Auto-generated document ID
- `name` (string) - Lead's full name
- `phoneNumber` (string) - Contact phone number
- `email` (string, optional) - Email address
- `source` (string) - Origin of lead: 'landing', 'mortgage', 'incentives', 'pricing', 'blog', 'properties', 'calculator'
- `metadata` (object, optional) - Additional context (calculator values, viewed property, etc.)
- `createdAt` (timestamp) - When lead was captured

**Indexes:**
- `source` (for filtering by source)
- `createdAt` (for sorting by date)

---

### 2. **appointments**
Property viewing appointments booked by clients.

**Fields:**
- `id` (string) - Auto-generated document ID
- `userId` (string, optional) - Reference to authenticated user
- `propertyId` (string, optional) - Property reference
- `propertyAddress` (string) - Property address for viewing
- `date` (string) - ISO date string
- `time` (string) - Time slot (e.g., "10:00 AM")
- `clientName` (string) - Client's name
- `clientPhone` (string) - Client's phone
- `clientEmail` (string) - Client's email
- `status` (string) - 'pending', 'confirmed', 'completed', 'cancelled'
- `notes` (string, optional) - Client notes
- `adminNotes` (string, optional) - Admin notes
- `createdAt` (timestamp) - When booked
- `updatedAt` (timestamp) - Last modified

**Indexes:**
- `date` (for calendar view)
- `status` (for filtering)
- `userId` (for client dashboard)

---

### 3. **webinar_signups**
Educational webinar signups.

**Fields:**
- `id` (string) - Auto-generated document ID
- `name` (string) - Attendee's name
- `email` (string) - Attendee's email
- `phoneNumber` (string) - Contact number
- `webinarDate` (string) - ISO date of webinar
- `createdAt` (timestamp) - When signed up

**Indexes:**
- `webinarDate` (for filtering by event)
- `createdAt` (for sorting)

---

### 4. **newsletters**
Newsletter email subscriptions.

**Fields:**
- `id` (string) - Auto-generated document ID
- `email` (string) - Subscriber email (unique)
- `name` (string, optional) - Subscriber name
- `source` (string) - Where they subscribed from
- `subscribed` (boolean) - Active subscription status
- `createdAt` (timestamp) - When subscribed

**Indexes:**
- `email` (unique constraint via app logic)
- `subscribed` (for filtering active subscribers)

---

### 5. **blogs**
Blog posts content management.

**Fields:**
- `id` (string) - Auto-generated document ID
- `title` (string) - Blog post title
- `content` (string) - Full blog content (markdown or HTML)
- `excerpt` (string, optional) - Short description (max 200 chars)
- `imageUrl` (string, optional) - Featured image URL
- `published` (boolean) - Publication status
- `createdAt` (timestamp) - When created
- `updatedAt` (timestamp) - Last modified

**Indexes:**
- `published` (for filtering published posts)
- `createdAt` (for sorting by date)

---

### 6. **properties**
Property listings (both MLS and custom).

**Fields:**
- `id` (string) - Auto-generated document ID
- `mlsNumber` (string, optional) - MLS listing number
- `address` (string) - Full property address
- `city` (string) - City
- `province` (string) - Province (default 'BC')
- `postalCode` (string, optional) - Postal code
- `price` (number) - Listing price
- `bedrooms` (number) - Number of bedrooms
- `bathrooms` (number) - Number of bathrooms
- `squareFeet` (number, optional) - Property size
- `propertyType` (string) - 'House', 'Condo', 'Townhouse', 'Land', 'Multi-Family', 'Other'
- `description` (string, optional) - Property description
- `features` (array of strings) - Property features
- `images` (array of strings) - Image URLs
- `status` (string) - 'active', 'pending', 'sold'
- `coordinates` (object, optional) - { lat: number, lng: number }
- `createdAt` (timestamp) - When added
- `updatedAt` (timestamp) - Last modified

**Indexes:**
- `city` (for location filtering)
- `price` (for range filtering)
- `status` (for filtering active listings)

---

### 7. **neighborhoods**
BC neighborhood data and statistics.

**Fields:**
- `id` (string) - Auto-generated document ID
- `name` (string) - Neighborhood name
- `city` (string) - City name
- `district` (string) - District/region
- `postalCodes` (array of strings) - Postal code coverage
- `coordinates` (object) - { lat: number, lng: number }
- `avgPrice` (number, optional) - Average property price
- `priceRange` (object, optional) - { min: number, max: number }
- `crimeRate` (string, optional) - Crime rate rating
- `schoolRating` (number, optional) - School rating (1-10)
- `walkScore` (number, optional) - Walk score (0-100)
- `transitScore` (number, optional) - Transit score (0-100)
- `medianAge` (number, optional) - Median age of residents
- `amenities` (array of strings, optional) - Nearby amenities
- `createdAt` (timestamp) - When added

**Indexes:**
- `city` (for filtering by city)
- `avgPrice` (for sorting by price)

---

### 8. **otp_codes**
One-time password codes for authentication.

**Fields:**
- `id` (string) - Auto-generated document ID
- `phoneNumber` (string) - Phone number
- `code` (string) - 6-digit OTP
- `expiresAt` (timestamp) - Expiration time (10 minutes from creation)
- `used` (boolean) - Whether code has been used
- `createdAt` (timestamp) - When generated

**Indexes:**
- `phoneNumber` (for lookup)
- `expiresAt` (for cleanup of expired codes)

**Cleanup:**
- Expired codes should be deleted periodically (via Cloud Function or scheduled job)

---

### 9. **users**
User accounts (admin and clients).

**Fields:**
- `id` (string) - Auto-generated document ID
- `phoneNumber` (string) - Phone number (unique identifier)
- `name` (string, optional) - User's name
- `email` (string, optional) - User's email
- `role` (string) - 'admin' or 'client'
- `verified` (boolean) - Phone verification status
- `lastLogin` (timestamp, optional) - Last login time
- `createdAt` (timestamp) - Account creation
- `updatedAt` (timestamp) - Last modified

**Indexes:**
- `phoneNumber` (unique constraint via app logic)
- `role` (for filtering admins/clients)

**Special Admin User:**
- Phone number: `+14034783995`
- Role: `admin`

---

## Security Rules

Firestore security rules should be configured to:

1. **Public read** for: blogs (published only), properties (active only), neighborhoods
2. **Authenticated write** for: appointments (by own userId), leads (create only)
3. **Admin only** for: all management operations, user data access, status updates
4. **OTP codes**: Only server-side access (no client access)

---

## Relationships

```
users (1) ----< (many) appointments
properties (1) ----< (many) appointments
```

---

## Data Migration Notes

**From PostgreSQL (V1) to Firestore (V2):**

1. No foreign key constraints - relationships handled in application logic
2. Arrays stored natively (no separate join tables)
3. Timestamps use Firestore Timestamp type
4. No auto-incrementing IDs - use Firestore auto-generated IDs
5. Queries use Firestore query syntax (not SQL)

---

### 10. **quiz_responses**
Quiz submissions from users with calculated affordability and incentives.

**Fields:**
- `id` (string) - Auto-generated document ID
- `userId` (string, optional) - Reference to authenticated user
- `sessionId` (string) - Session identifier for anonymous users
- `income` (number) - Annual household income
- `savings` (number) - Down payment savings
- `hasRRSP` (boolean) - Whether user has RRSP funds
- `propertyType` (string) - 'condo', 'townhome', or 'detached'
- `timeline` (string) - '1-3', '3-6', or '6-12' months
- `calculatedAffordability` (number) - Maximum affordable home price
- `calculatedIncentives` (object) - Breakdown of savings
  - `ptt` (number) - Property Transfer Tax exemption
  - `gst` (number) - GST/HST rebate
  - `fhsa` (number) - FHSA tax benefit
  - `total` (number) - Total first-year savings
- `createdAt` (timestamp) - When quiz was submitted

**Indexes:**
- `userId` (for retrieving user's quiz)
- `sessionId` (for anonymous user tracking)
- `createdAt` (for sorting)

---

### 11. **user_progress**
Tracks user progress through the 8-milestone home-buying journey.

**Fields:**
- `id` (string) - Auto-generated document ID
- `userId` (string) - User or session identifier
- `quizResponseId` (string) - Reference to quiz response
- `milestones` (object) - Status of all 8 milestones
  - `step1_creditScore` (object)
    - `status` (string) - 'pending', 'in_progress', or 'completed'
    - `data` (object) - { score?, method? }
    - `completedAt` (timestamp, optional)
  - `step2_fhsa` (object)
    - `status` (string)
    - `data` (object) - { opened?, provider?, proofUrl? }
    - `completedAt` (timestamp, optional)
  - `step3_preApproval` (object)
    - `status` (string)
    - `data` (object) - { ratePreferences?, documentsUploaded?, approvedAmount? }
    - `completedAt` (timestamp, optional)
  - `step4_incentives` (object)
    - `status` (string) - Auto-completed from quiz
    - `data` (object) - { totalSavings }
    - `completedAt` (timestamp)
  - `step5_neighborhoods` (object)
    - `status` (string)
    - `data` (object) - { viewedNeighborhoods? }
    - `completedAt` (timestamp, optional)
  - `step6_searchProperties` (object)
    - `status` (string)
    - `data` (object) - { savedCount? }
    - `completedAt` (timestamp, optional)
  - `step7_bookViewing` (object)
    - `status` (string)
    - `data` (object) - { appointmentIds? }
    - `completedAt` (timestamp, optional)
  - `step8_makeOffer` (object)
    - `status` (string)
    - `data` (object) - { offerIds? }
    - `completedAt` (timestamp, optional)
- `overallProgress` (number) - Percentage complete (0-100)
- `updatedAt` (timestamp) - Last modified

**Indexes:**
- `userId` (for retrieving user's progress)
- `overallProgress` (for admin analytics)

---

### 12. **mortgage_rates_cache**
Cached mortgage rates from external APIs.

**Fields:**
- `id` (string) - Auto-generated document ID
- `province` (string) - Province code (e.g., 'BC')
- `rates` (array) - Array of rate objects
  - `lender` (string) - Lender name
  - `type` (string) - 'fixed' or 'variable'
  - `term` (number) - Term in years
  - `rate` (number) - Interest rate (as decimal)
  - `province` (string) - Province code
  - `lastUpdated` (timestamp, optional) - When rate was updated
- `cachedAt` (timestamp) - When cache was created
- `expiresAt` (timestamp) - When cache expires (24 hours)

**Indexes:**
- `province` (for filtering by location)
- `expiresAt` (for cleanup of expired caches)

**Cleanup:**
- Expired caches should be deleted daily via cron job

---

### 13. **offers**
Property purchase offers created by users.

**Fields:**
- `id` (string) - Auto-generated document ID
- `userId` (string) - User or session identifier
- `propertyZpid` (string, optional) - Zillow property ID
- `propertyAddress` (string) - Property address
- `propertyDetails` (object)
  - `price` (number) - Listing price
  - `beds` (number, optional) - Bedrooms
  - `baths` (number, optional) - Bathrooms
- `offerDetails` (object)
  - `offerPrice` (number) - Offered price
  - `subjects` (array of strings) - Conditions (e.g., ['financing', 'inspection'])
  - `notes` (string, optional) - Additional notes
- `status` (string) - 'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'
- `submittedAt` (timestamp, optional) - When submitted to admin
- `reviewedAt` (timestamp, optional) - When reviewed by admin
- `reviewedBy` (string, optional) - Admin user ID
- `adminNotes` (string, optional) - Admin notes
- `createdAt` (timestamp) - When created
- `updatedAt` (timestamp) - Last modified

**Indexes:**
- `userId` (for retrieving user's offers)
- `status` (for admin filtering)
- `createdAt` (for sorting)

---

**Last Updated:** Phase 1 Complete - December 12, 2024

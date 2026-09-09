# Emergency Ambulance Dispatch System — Project Requirements & Compliance Checklist

> **Purpose:** This document is the single source of truth for verifying that the Emergency Ambulance Dispatch System satisfies the assignment requirements.  
> **Audit rule:** A requirement is considered **PASS** only when it is implemented in the backend, connected to the database where applicable, protected/validated where required, and demonstrable through Postman or the deployed API.  
> **Important:** This checklist must be audited against the current source code before claiming 100% completion.

---

## 1. Project Overview

The **Emergency Ambulance Dispatch System** is a backend-focused emergency healthcare platform for receiving emergency requests, determining priority, locating suitable available ambulances, dispatching drivers, tracking the trip lifecycle, selecting hospitals, recording incidents, processing payments, and maintaining secure audit history.

### Main Emergency Workflow

```text
Emergency Request
       │
       ▼
Determine Priority
       │
       ▼
Find Available Ambulance
       │
       ▼
Dispatch
       │
       ▼
Driver Accepts
       │
       ▼
Ambulance En Route
       │
       ▼
Patient Pickup
       │
       ▼
Hospital Selection
       │
       ▼
Ambulance En Route to Hospital
       │
       ▼
Hospital Arrival
       │
       ▼
Trip Completed
       │
       ▼
Ambulance Available Again
```

---

# 2. Fixed Primary Roles

The assignment requires exactly **3 fixed primary roles** with strict RBAC.

## Recommended project roles

1. **PATIENT** — Patient / Caller
2. **DISPATCHER** — Dispatcher / Operations
3. **ADMIN** — System Administrator

> Driver and Hospital should be represented as operational entities/profiles linked to users, or handled through the three fixed roles according to the final authorization design. Do **not** silently create additional primary RBAC roles if the assignment evaluator expects exactly three fixed roles.

### PATIENT permissions

- Register and login
- Manage own profile
- Create emergency request
- Provide patient/emergency information
- Provide pickup location
- View own emergency requests
- View own trip status
- View assigned ambulance information where permitted
- Receive notifications
- Initiate required trip/payment flow where applicable
- Cancel own request only when business rules permit
- View own payment status/history

### DISPATCHER permissions

- Login
- View emergency requests
- Search/filter/sort emergency requests
- Review and assign priority
- View available ambulances
- View suitable ambulances
- Assign ambulance/driver
- Monitor active trips
- Handle dispatch failures
- Cancel/reassign according to business rules
- Select/update hospital destination
- View operational notifications
- View relevant incident history

### ADMIN permissions

- All administrative management operations
- Manage users
- Manage roles/statuses where allowed
- Manage ambulances
- Manage driver profiles
- Manage hospitals
- Monitor emergency requests and trips
- View dashboard statistics
- View reports and analytics
- View audit logs
- Manage/override operational records only where explicitly allowed
- Review payments
- Perform soft-delete/restore operations where implemented

---

# 3. Required Technology Stack

| Area | Required / Recommended | Compliance |
|---|---|---|
| Runtime | Node.js | ☐ |
| Language | TypeScript | ☐ |
| Framework | Express.js | ☐ |
| Database | PostgreSQL | ☐ |
| ORM | Prisma | ☐ |
| Validation | Zod or Joi | ☐ |
| Authentication | JWT / Better Auth / Clerk | ☐ |
| Password hashing | Bcrypt or equivalent secure hashing | ☐ |
| API documentation/testing | Postman / Swagger | ☐ |
| Deployment | Vercel / Render or equivalent accepted platform | ☐ |
| Redis | Optional but recommended | ☐ |
| Email | Optional | ☐ |
| File storage | Optional | ☐ |
| Payment | **MANDATORY:** bKash / Stripe / SSLCommerz | ☐ |

---

# 4. Core Features

## Emergency Requests

- ☐ Create emergency request
- ☐ Patient information
- ☐ Caller information
- ☐ Emergency description
- ☐ Pickup location
- ☐ Location coordinates where applicable
- ☐ Emergency priority
- ☐ Request status
- ☐ Request timestamps
- ☐ Request ownership/access control
- ☐ Cancellation rules
- ☐ Request history

## Priority Levels

- ☐ CRITICAL
- ☐ HIGH
- ☐ MEDIUM
- ☐ LOW

Higher-priority requests must be processed before lower-priority requests where operationally appropriate.

## Ambulance Management

- ☐ Register ambulance
- ☐ Update ambulance
- ☐ View ambulance
- ☐ List ambulances
- ☐ Soft-delete ambulance
- ☐ Ambulance registration/identifier
- ☐ Ambulance type
- ☐ Equipment/capability
- ☐ Operational status
- ☐ Availability state
- ☐ Driver association

## Ambulance Status

- ☐ AVAILABLE
- ☐ ASSIGNED
- ☐ EN_ROUTE
- ☐ PICKING_UP
- ☐ TO_HOSPITAL
- ☐ MAINTENANCE
- ☐ OFFLINE

## Driver Management

- ☐ Driver profile
- ☐ Driver availability
- ☐ Driver-to-ambulance relationship
- ☐ Assigned emergency visibility
- ☐ Assignment acceptance/rejection or equivalent operational action
- ☐ Status update permissions
- ☐ Driver activity history

## Hospital Management

- ☐ Hospital registration
- ☐ Hospital information
- ☐ Emergency availability
- ☐ Bed availability
- ☐ ICU availability where applicable
- ☐ Hospital status
- ☐ Update hospital availability
- ☐ Select suitable hospital
- ☐ Incoming emergency notification

---

# 5. Emergency / Trip Lifecycle

The implementation must enforce valid state transitions.

```text
REQUESTED
   ↓
PRIORITY_ASSIGNED
   ↓
AMBULANCE_ASSIGNED
   ↓
DRIVER_ACCEPTED
   ↓
EN_ROUTE
   ↓
PATIENT_PICKED_UP
   ↓
TO_HOSPITAL
   ↓
ARRIVED
   ↓
COMPLETED
```

Additional terminal states:

- ☐ CANCELLED
- ☐ FAILED

### State-transition requirements

- ☐ Invalid transitions are rejected
- ☐ Only authorized roles can perform transitions
- ☐ Every important transition is persisted
- ☐ Related ambulance status is synchronized
- ☐ Related assignment status is synchronized
- ☐ Hospital information is synchronized when selected
- ☐ Completion makes the ambulance available again
- ☐ Cancellation/failure releases operational resources where appropriate

---

# 6. Ambulance Dispatch Logic

The dispatch operation must be meaningful business logic, not simple CRUD.

Candidate ambulance selection should consider:

- ☐ Availability
- ☐ Operational status
- ☐ Driver availability
- ☐ Ambulance type
- ☐ Required equipment
- ☐ Emergency priority
- ☐ Distance/proximity where location data is available
- ☐ Existing active assignment
- ☐ Hospital/route constraints where applicable

### Duplicate assignment prevention

The same ambulance must never be assigned to multiple active emergency requests.

Required:

- ☐ Database transaction
- ☐ Conditional availability check
- ☐ Atomic status update
- ☐ Concurrency-safe assignment
- ☐ Failure rollback
- ☐ Proper conflict response when ambulance is already assigned

Example:

```text
Request A ──► Ambulance 101 ──► SUCCESS
Request B ──► Ambulance 101 ──► REJECTED
```

---

# 7. Database & Prisma Requirements

## Required relational entities

At minimum, the data model should cover:

- ☐ User
- ☐ Patient/Caller profile
- ☐ Driver profile
- ☐ Ambulance
- ☐ Hospital
- ☐ EmergencyRequest
- ☐ Assignment
- ☐ Trip
- ☐ Notification
- ☐ IncidentHistory
- ☐ AuditLog
- ☐ Payment

### Database requirements

- ☐ PostgreSQL connected
- ☐ Prisma schema implemented
- ☐ Foreign-key relationships
- ☐ Appropriate indexes
- ☐ Unique constraints where needed
- ☐ Enum values for controlled statuses
- ☐ Created/updated timestamps
- ☐ Soft-delete field (`deletedAt`) on applicable resources
- ☐ Payment identifiers/status fields
- ☐ Audit/incident relationships
- ☐ No exposed database credentials
- ☐ Prisma migrations maintained

### Recommended indexes

Index fields used frequently for:

- emergency status
- emergency priority
- ambulance status
- ambulance availability
- driver availability
- hospital availability
- createdAt
- user email
- payment status
- foreign keys used in filtering

---

# 8. Authentication

Required:

- ☐ Register
- ☐ Login
- ☐ Password hashing
- ☐ JWT access token
- ☐ Refresh token flow
- ☐ Logout/token invalidation strategy
- ☐ Bearer authentication
- ☐ Protected routes
- ☐ Authentication middleware
- ☐ Token validation
- ☐ Expiration handling
- ☐ Secure secret management
- ☐ No password returned in API responses

---

# 9. Authorization / RBAC

Every private endpoint must explicitly enforce permissions.

Required:

- ☐ Role extraction from authenticated user
- ☐ Role middleware
- ☐ PATIENT authorization
- ☐ DISPATCHER authorization
- ☐ ADMIN authorization
- ☐ Unauthorized role receives appropriate error
- ☐ Unauthenticated user cannot access protected resources
- ☐ Ownership checks for patient-owned resources
- ☐ Admin-only operations protected

---

# 10. Validation

Use **Zod or Joi**.

Required:

- ☐ Request body validation
- ☐ Query parameter validation
- ☐ Route parameter validation
- ☐ Enum validation
- ☐ Email validation
- ☐ Password validation
- ☐ Coordinates validation where used
- ☐ Pagination validation
- ☐ Payment input validation
- ☐ Status-transition validation
- ☐ Meaningful validation error responses

---

# 11. Standard API Response

Every endpoint must follow the standardized response structure.

## Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

Required:

- ☐ Success responses standardized
- ☐ Error responses standardized
- ☐ Validation errors structured
- ☐ HTTP status codes used correctly
- ☐ No stack traces/secrets exposed in production

---

# 12. Minimum 20 Meaningful APIs

The project must implement **at least 20 real, meaningful endpoints**.

## Authentication

- ☐ `POST /api/v1/auth/register`
- ☐ `POST /api/v1/auth/login`
- ☐ `POST /api/v1/auth/refresh-token`
- ☐ `POST /api/v1/auth/logout`

## User/Profile

- ☐ `GET /api/v1/users/me`
- ☐ `PATCH /api/v1/users/me`

## Emergency Requests

- ☐ `POST /api/v1/emergency-requests`
- ☐ `GET /api/v1/emergency-requests`
- ☐ `GET /api/v1/emergency-requests/:id`
- ☐ `PATCH /api/v1/emergency-requests/:id`
- ☐ `DELETE /api/v1/emergency-requests/:id` — soft delete
- ☐ `GET /api/v1/emergency-requests/search?q=keyword`

## Dispatch / Business Operations

- ☐ `PATCH /api/v1/emergency-requests/:id/priority`
- ☐ `GET /api/v1/emergency-requests/:id/available-ambulances`
- ☐ `POST /api/v1/emergency-requests/:id/assign`
- ☐ `POST /api/v1/emergency-requests/:id/cancel`
- ☐ `PATCH /api/v1/emergency-requests/:id/status`
- ☐ `GET /api/v1/emergency-requests/my-requests`

## Ambulances

- ☐ `POST /api/v1/ambulances`
- ☐ `GET /api/v1/ambulances`
- ☐ `GET /api/v1/ambulances/:id`
- ☐ `PATCH /api/v1/ambulances/:id`
- ☐ `DELETE /api/v1/ambulances/:id` — soft delete
- ☐ `PATCH /api/v1/ambulances/:id/status`

## Drivers

- ☐ `POST /api/v1/drivers`
- ☐ `GET /api/v1/drivers`
- ☐ `GET /api/v1/drivers/:id`
- ☐ `PATCH /api/v1/drivers/:id`
- ☐ `PATCH /api/v1/drivers/:id/availability`

## Hospitals

- ☐ `POST /api/v1/hospitals`
- ☐ `GET /api/v1/hospitals`
- ☐ `GET /api/v1/hospitals/:id`
- ☐ `PATCH /api/v1/hospitals/:id`
- ☐ `DELETE /api/v1/hospitals/:id` — soft delete
- ☐ `PATCH /api/v1/hospitals/:id/availability`

## Trips

- ☐ `GET /api/v1/trips`
- ☐ `GET /api/v1/trips/:id`
- ☐ `PATCH /api/v1/trips/:id/status`
- ☐ `POST /api/v1/trips/:id/complete`

## Payments — Mandatory

- ☐ `POST /api/v1/payments/initiate`
- ☐ `POST /api/v1/payments/success` or gateway success callback
- ☐ `POST /api/v1/payments/cancel`
- ☐ `POST /api/v1/payments/fail`
- ☐ `POST /api/v1/payments/webhook` where supported
- ☐ `GET /api/v1/payments/:id`

## Notifications / History

- ☐ `GET /api/v1/notifications`
- ☐ `PATCH /api/v1/notifications/:id/read`
- ☐ `GET /api/v1/emergency-requests/:id/incidents`

## Admin

- ☐ `GET /api/v1/admin/users`
- ☐ `PATCH /api/v1/admin/users/:id/role`
- ☐ `GET /api/v1/admin/dashboard-stats`
- ☐ `GET /api/v1/admin/audit-logs`

> The list above intentionally exceeds 20 so the project has enough meaningful coverage without dummy endpoints.

---

# 13. Pagination

At least one list endpoint must support:

```http
?page=1&limit=10
```

Required:

- ☐ `page`
- ☐ `limit`
- ☐ total count
- ☐ total pages
- ☐ current page
- ☐ appropriate default limit
- ☐ maximum limit protection

Example response:

```json
{
  "success": true,
  "message": "Emergency requests retrieved successfully",
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

# 14. Filtering & Sorting

At least one list API must support filtering and/or sorting.

Example:

```http
GET /api/v1/emergency-requests?status=REQUESTED&priority=CRITICAL&sortBy=createdAt&sortOrder=desc
```

Required:

- ☐ Status filter
- ☐ Priority filter
- ☐ Date filter where relevant
- ☐ Sorting
- ☐ Safe allow-list for sortable fields
- ☐ Pagination compatibility

---

# 15. Search

Search must be meaningful to the domain.

Examples:

```http
GET /api/v1/emergency-requests/search?q=accident
GET /api/v1/ambulances?search=AMB-101
GET /api/v1/hospitals?search=Dhaka
```

Required:

- ☐ Search query validation
- ☐ Database-backed search
- ☐ Search results follow authorization
- ☐ Search is not a dummy/static implementation

---

# 16. Soft Delete

Hard deletion must not be used for applicable core resources.

Required:

- ☐ `deletedAt` field
- ☐ Soft-delete service logic
- ☐ Deleted records excluded from normal queries
- ☐ Unique-field behavior considered
- ☐ Admin restore strategy where appropriate
- ☐ Delete endpoint documented as soft delete

---

# 17. Audit Logs

Critical system actions must be recorded.

Track at minimum:

- ☐ User creation
- ☐ Login/security-sensitive events where appropriate
- ☐ Emergency request creation
- ☐ Priority change
- ☐ Ambulance assignment
- ☐ Driver acceptance
- ☐ Status change
- ☐ Hospital selection
- ☐ Cancellation
- ☐ Trip completion
- ☐ User role changes
- ☐ Resource soft deletion
- ☐ Payment status changes

Audit record should identify:

- actor/user
- action
- entity/resource
- entity ID
- previous value where appropriate
- new value where appropriate
- timestamp
- metadata/IP where appropriate

---

# 18. Incident History

Each emergency should maintain chronological operational history.

Required events:

1. ☐ Request created
2. ☐ Priority assigned
3. ☐ Ambulance assigned
4. ☐ Driver accepted
5. ☐ Ambulance departed
6. ☐ Patient picked up
7. ☐ Hospital selected
8. ☐ Hospital arrival
9. ☐ Trip completed
10. ☐ Trip cancelled/failed where applicable

---

# 19. Notifications

Required where applicable:

- ☐ Dispatcher notified of new emergency
- ☐ Driver notified of assignment
- ☐ Patient/caller notified of assignment
- ☐ Users notified of relevant status changes
- ☐ Hospital notified of incoming emergency
- ☐ Notification persistence
- ☐ Read/unread state
- ☐ Authorization on notification access

Real-time transport such as Socket.IO is optional unless implemented as a project enhancement.

---

# 20. Payment Integration — MANDATORY

This requirement **cannot be skipped**.

Accepted gateway:

- ☐ bKash
- ☐ Stripe
- ☐ SSLCommerz

The payment system must be a **real gateway integration**, not a fake/manual status field.

Required:

- ☐ Payment initiation
- ☐ Gateway request
- ☐ Secure callback/success handling
- ☐ Cancellation handling
- ☐ Failure handling
- ☐ Webhook where supported
- ☐ Payment verification
- ☐ Payment status persistence
- ☐ Transaction ID persistence
- ☐ Amount validation
- ☐ Duplicate payment protection
- ☐ Payment-to-user relationship
- ☐ Payment-to-trip/emergency relationship
- ☐ Invalid callback protection
- ☐ Secrets stored in environment variables
- ☐ No secret/API credential committed to Git

Recommended payment states:

```text
PENDING
PAID
FAILED
CANCELLED
REFUNDED
```

---

# 21. Transactions & Concurrency

The dispatch workflow must be transaction-safe.

Required:

- ☐ Prisma transaction around assignment
- ☐ Ambulance availability checked inside transaction
- ☐ Ambulance status updated atomically
- ☐ Assignment created atomically
- ☐ Trip created/updated atomically where required
- ☐ Rollback on failure
- ☐ Duplicate assignment conflict handled
- ☐ Concurrent dispatch requests tested

### Required concurrency scenario

Two dispatch requests attempt to assign the same ambulance simultaneously.

Expected:

```text
Request A → SUCCESS
Request B → CONFLICT / REJECTED
```

Only one active assignment may exist.

---

# 22. Performance

Required:

- ☐ Database indexes
- ☐ Efficient Prisma queries
- ☐ `select` used where full records are unnecessary
- ☐ Pagination
- ☐ Filtering
- ☐ Search optimization where appropriate
- ☐ Avoid N+1 queries
- ☐ Redis caching if useful/required by implementation
- ☐ No unnecessary database calls
- ☐ Proper transaction boundaries

---

# 23. Security

Required:

- ☐ Password hashing
- ☐ JWT/Bearer authentication
- ☐ RBAC
- ☐ Private route protection
- ☐ Helmet/security headers
- ☐ CORS configuration
- ☐ Rate limiting
- ☐ Environment variables for secrets
- ☐ No secrets in Git
- ☐ Request validation
- ☐ Safe error messages
- ☐ SQL injection protection through Prisma
- ☐ Authorization/ownership checks
- ☐ Payment callback security
- ☐ Sensitive data not exposed
- ☐ Production error stack traces disabled

---

# 24. Rate Limiting

Use `express-rate-limit` or an equivalent implementation.

Required:

- ☐ Global/API rate limiting
- ☐ Stricter authentication rate limit
- ☐ Appropriate response for excessive requests
- ☐ Standard rate-limit headers
- ☐ Redis-backed store if distributed deployment requires it

Example:

```ts
windowMs: 1 * 60 * 1000,
max: 5
```

Do not use a misleading error message such as "15 minutes" when the actual window is 1 minute.

---

# 25. CORS

Required:

- ☐ CORS configured
- ☐ Allowed origins explicitly controlled
- ☐ Credentials configured correctly if cookies are used
- ☐ No unnecessary wildcard production configuration

---

# 26. API Versioning

All APIs must use versioned routes.

Required format:

```text
/api/v1/...
```

Required:

- ☐ Version prefix implemented consistently
- ☐ No important production endpoint bypasses the versioning convention

---

# 27. RESTful Design

Required:

- ☐ Resource-based URLs
- ☐ Correct HTTP methods
- ☐ Meaningful status codes
- ☐ No unnecessary action endpoints
- ☐ Business actions use clear action routes where appropriate
- ☐ Consistent naming
- ☐ Consistent response format

---

# 28. Error Handling

Required:

- ☐ Central error handler
- ☐ Custom application error class where appropriate
- ☐ Prisma errors handled
- ☐ Validation errors handled
- ☐ Authentication errors handled
- ☐ Authorization errors handled
- ☐ Not-found errors handled
- ☐ Conflict errors handled
- ☐ Payment errors handled
- ☐ Unknown errors handled
- ☐ Production-safe error output

Recommended status codes:

```text
200 OK
201 CREATED
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
409 CONFLICT
422 UNPROCESSABLE ENTITY
429 TOO MANY REQUESTS
500 INTERNAL SERVER ERROR
```

---

# 29. Reports & Analytics

Admin reporting should include meaningful database-backed statistics.

Minimum recommended:

- ☐ Total users
- ☐ Total emergency requests
- ☐ Requests by priority
- ☐ Requests by status
- ☐ Total ambulances
- ☐ Available ambulances
- ☐ Active trips
- ☐ Completed trips
- ☐ Cancelled/failed trips
- ☐ Hospital statistics
- ☐ Payment totals/status statistics
- ☐ Time/date-based statistics where appropriate

No static/hardcoded dashboard values.

---

# 30. Postman Documentation & Testing

Postman must demonstrate the actual deployed/local APIs.

Required collection sections:

- ☐ Auth
- ☐ Users/Profile
- ☐ Emergency Requests
- ☐ Ambulances
- ☐ Drivers
- ☐ Hospitals
- ☐ Trips
- ☐ Payments
- ☐ Notifications
- ☐ Admin
- ☐ Audit/Incident History

### Postman environment

Recommended variables:

```text
base_url
access_token
refresh_token
patient_id
dispatcher_id
admin_id
emergency_request_id
ambulance_id
driver_id
hospital_id
trip_id
payment_id
```

### Postman tests

Where applicable:

- ☐ Status-code assertions
- ☐ Response structure assertions
- ☐ Token extraction
- ☐ ID extraction
- ☐ Authentication tests
- ☐ RBAC tests
- ☐ Validation failure tests
- ☐ Conflict tests
- ☐ Pagination tests
- ☐ Filtering/sorting tests
- ☐ Search tests
- ☐ Payment tests
- ☐ State-transition tests
- ☐ Soft-delete tests

---

# 31. Required Negative Tests

Do not test only successful requests.

Required:

- ☐ Duplicate registration
- ☐ Wrong password
- ☐ Missing token
- ☐ Invalid token
- ☐ Wrong role
- ☐ Invalid request body
- ☐ Invalid ID
- ☐ Missing resource
- ☐ Invalid status transition
- ☐ Assign unavailable ambulance
- ☐ Concurrent/duplicate ambulance assignment
- ☐ Unauthorized resource access
- ☐ Soft-deleted resource access
- ☐ Invalid payment callback
- ☐ Duplicate payment
- ☐ Rate-limit violation

---

# 32. Deployment

Required:

- ☐ Production deployment
- ☐ Production database
- ☐ Environment variables configured
- ☐ `DATABASE_URL` configured
- ☐ JWT secrets configured
- ☐ Payment credentials configured
- ☐ CORS production origin configured
- ☐ Migrations applied
- ☐ API health endpoint
- ☐ Production API tested through Postman
- ☐ No localhost dependency in production
- ☐ No secret values exposed in repository
- ☐ README contains production API information

Recommended health endpoint:

```http
GET /api/v1/health
```

---

# 33. Environment Variables

Secrets must be stored outside source code.

Example:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

CORS_ORIGIN=

REDIS_URL=

PAYMENT_PROVIDER=
PAYMENT_APP_KEY=
PAYMENT_APP_SECRET=
PAYMENT_BASE_URL=
PAYMENT_CALLBACK_URL=
```

Only variables actually required by the implementation should be present.

---

# 34. Project Structure

Recommended modular structure:

```text
src/
├── app/
├── config/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── emergencyRequest/
│   ├── ambulance/
│   ├── driver/
│   ├── hospital/
│   ├── assignment/
│   ├── trip/
│   ├── notification/
│   ├── payment/
│   ├── incident/
│   └── audit/
├── routes/
├── utils/
├── types/
├── errors/
└── server.ts

prisma/
└── schema.prisma

postman/
└── Emergency-Ambulance-Dispatch.postman_collection.json
```

The exact structure may differ, but responsibilities must remain modular.

---

# 35. Documentation

README must include:

- ☐ Project name
- ☐ Project objective
- ☐ Features
- ☐ Technology stack
- ☐ Architecture overview
- ☐ Database overview
- ☐ Environment setup
- ☐ Installation instructions
- ☐ Migration instructions
- ☐ Seed instructions
- ☐ Local development
- ☐ API base URL
- ☐ Authentication instructions
- ☐ Role descriptions
- ☐ Payment setup
- ☐ Postman collection
- ☐ Deployment information
- ☐ Testing instructions
- ☐ Important business rules
- ☐ Concurrency/dispatch explanation

---

# 36. Final Submission Requirements

## Planning & Database

- ☐ Requirements document
- ☐ ERD
- ☐ Prisma schema
- ☐ Project setup
- ☐ API plan

## Auth & Core APIs

- ☐ JWT/Bearer authentication
- ☐ RBAC middleware
- ☐ User management
- ☐ Core CRUD
- ☐ Validation

## Business Logic

- ☐ 20+ meaningful APIs
- ☐ Emergency priority logic
- ☐ Ambulance dispatch logic
- ☐ Transaction-safe assignment
- ☐ State transitions
- ☐ Pagination
- ☐ Filtering/sorting
- ☐ Search
- ☐ Soft delete
- ☐ Audit logs
- ☐ Error handling
- ☐ Rate limiting

## Payment & Testing

- ☐ Real payment gateway
- ☐ Payment initiation
- ☐ Success/callback
- ☐ Cancellation
- ☐ Failure
- ☐ Webhook/verification where supported
- ☐ Payment status tracking
- ☐ Postman collection
- ☐ Positive tests
- ☐ Negative tests
- ☐ Concurrency tests

## Deployment & Submission

- ☐ Production deployment
- ☐ Database connected
- ☐ Environment variables
- ☐ Production API tested
- ☐ README polished
- ☐ ERD/schema included
- ☐ Postman documentation included
- ☐ Demo/video prepared
- ☐ Final QA completed

---

# 37. Compliance Scorecard

| Area | Required | Status |
|---|---:|---|
| 3 fixed primary roles | Yes | ☐ |
| Authentication | Yes | ☐ |
| Bearer token | Yes | ☐ |
| RBAC | Yes | ☐ |
| PostgreSQL | Yes | ☐ |
| Prisma | Yes | ☐ |
| Zod/Joi validation | Yes | ☐ |
| 20+ meaningful APIs | Yes | ☐ |
| API versioning | Yes | ☐ |
| Standard response format | Yes | ☐ |
| Pagination | Yes | ☐ |
| Filtering/sorting | Yes | ☐ |
| Search | Yes | ☐ |
| Soft delete | Yes | ☐ |
| Audit logs | Yes | ☐ |
| Business workflows | Yes | ☐ |
| Transaction-safe dispatch | Yes | ☐ |
| Duplicate assignment prevention | Yes | ☐ |
| Rate limiting | Yes | ☐ |
| Helmet | Yes | ☐ |
| CORS | Yes | ☐ |
| Payment gateway | **MANDATORY** | ☐ |
| Payment callback/webhook | **MANDATORY** | ☐ |
| Payment status tracking | **MANDATORY** | ☐ |
| Postman documentation | Yes | ☐ |
| Negative testing | Yes | ☐ |
| Production deployment | Yes | ☐ |
| README | Yes | ☐ |
| ERD | Yes | ☐ |
| Prisma schema | Yes | ☐ |
| Final QA | Yes | ☐ |

---

# 38. Definition of 100% Complete

The project should be marked **100% COMPLETE** only if:

1. All mandatory requirements in this document are implemented.
2. Every mandatory API exists and is connected to the real database.
3. All private APIs enforce Bearer authentication.
4. RBAC correctly restricts PATIENT, DISPATCHER, and ADMIN operations.
5. Emergency/ambulance/trip state transitions are validated.
6. Ambulance assignment is transaction-safe and concurrency-safe.
7. Duplicate active assignments are impossible.
8. Pagination, filtering/sorting, and search are demonstrable.
9. Applicable resources use soft delete.
10. Critical actions create audit/incident history.
11. Rate limiting, Helmet, CORS, validation, and safe error handling are active.
12. A real payment gateway is integrated and payment states are verified from the gateway.
13. Payment callbacks/webhooks are securely handled.
14. At least 20 meaningful APIs are documented and tested.
15. Postman demonstrates both successful and failed scenarios.
16. Production deployment works without localhost-only dependencies.
17. Database migrations are applied successfully.
18. README and project documentation are complete.
19. No secrets are committed to the repository.
20. Final end-to-end QA passes.

---

# 39. Audit Result

> **Current audit status:** PENDING SOURCE-CODE VERIFICATION

This document defines the complete compliance checklist.  
A final PASS/FAIL result must be produced after inspecting the current project source, Prisma schema/migrations, environment configuration structure, routes/controllers/services, middleware, payment integration, Postman collection, and deployment configuration.

**Do not claim 100% completion from this document alone.**

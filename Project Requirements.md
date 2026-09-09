I have provided a document named `Project Requirements.md` for my project:

**Emergency Ambulance Dispatch System**

I want you to perform a COMPLETE and STRICT source-code audit of my project.

IMPORTANT:
Do NOT assume that a requirement is completed just because it is mentioned in `Project Requirements.md`.

You must inspect my ACTUAL PROJECT SOURCE CODE and verify every requirement against the implementation.

Your goal is to determine:

1. What is correctly implemented
2. What is partially implemented
3. What is missing
4. What is incorrectly implemented
5. What is insecure or technically weak
6. What does not follow the assignment requirements
7. What needs to be fixed before submission
8. Whether the project can honestly be considered 100% complete

==================================================
PROJECT REQUIREMENTS
====================

Use the attached `Project Requirements.md` as the SINGLE SOURCE OF TRUTH.

You must check EVERY requirement in that document.

DO NOT SKIP ANY SECTION.

The document contains requirements for:

* Project planning
* 3 fixed primary roles
* PostgreSQL
* Prisma
* TypeScript
* Express.js
* Zod/Joi
* JWT/Bearer authentication
* Password hashing
* RBAC
* Emergency requests
* Priority management
* Ambulance management
* Driver management
* Hospital management
* Trip lifecycle
* Emergency state transitions
* Ambulance dispatch logic
* Duplicate assignment prevention
* Prisma transactions
* Concurrency safety
* Database relationships
* Database indexes
* Unique constraints
* Soft delete
* Audit logs
* Incident history
* Notifications
* Mandatory payment gateway
* Payment callbacks/webhooks
* Payment verification
* Payment status tracking
* Pagination
* Filtering
* Sorting
* Search
* Rate limiting
* Helmet
* CORS
* API versioning
* RESTful design
* Error handling
* Reports and analytics
* Postman documentation
* Negative testing
* Deployment
* Environment variables
* Project structure
* README
* ERD
* Prisma schema
* Final QA
* 20+ meaningful APIs
* Final compliance scorecard

==================================================
STRICT AUDIT RULE
=================

A requirement can only be marked:

PASS

if you can verify that it is actually implemented in the source code and works correctly.

Use:

PASS = Fully implemented and correctly working

PARTIAL = Some implementation exists but it is incomplete, weak, or missing an important part

FAIL = Implementation exists but does not satisfy the requirement correctly

MISSING = No implementation found

NOT APPLICABLE = Only when the requirement genuinely does not apply, and explain why

DO NOT mark something PASS merely because:

* A route name exists
* A function exists
* A comment mentions it
* It appears in README
* It appears in Prisma schema but is not actually used
* It appears in Postman but backend implementation is missing
* It works only locally but not in production
* It uses a fake/mock implementation
* It is hardcoded
* It is manually changing database status
* It is not protected by authentication/RBAC where required

==================================================
SOURCE CODE INSPECTION
======================

Inspect the complete project, including where applicable:

* package.json
* tsconfig.json
* src/
* controllers
* services
* routes
* middleware
* validators
* utils
* config
* error handlers
* authentication code
* authorization/RBAC
* Prisma schema
* Prisma migrations
* seed files
* database queries
* transaction logic
* payment integration
* Redis configuration
* rate limiter
* Helmet
* CORS
* environment configuration
* Postman collection
* README
* deployment configuration
* Vercel/Render configuration
* API route registration
* production configuration

If something cannot be verified from the provided files, mark it as:

NOT VERIFIED

Do not assume it works.

==================================================
API AUDIT
=========

Find EVERY registered API route from the source code.

Create a complete API inventory.

For each API show:

* HTTP method
* Actual route
* Controller
* Service
* Authentication required?
* Required role
* Validation
* Database operation
* Response format
* HTTP status code
* Requirement satisfied?
* Evidence/file location

Then compare the actual API inventory against the required APIs in `Project Requirements.md`.

IMPORTANT:

The project requires at least 20 meaningful APIs.

Count ONLY real, meaningful, database-connected APIs.

Do NOT count:

* duplicate routes
* dummy routes
* test routes
* health endpoint as a business API
* unnecessary CRUD endpoints created only to reach 20
* fake payment endpoints
* unused routes

Tell me the exact number of meaningful APIs.

==================================================
ROLE / RBAC AUDIT
=================

The assignment requires exactly 3 fixed primary roles:

PATIENT
DISPATCHER
ADMIN

Verify:

* Where roles are defined
* How roles are stored
* Authentication middleware
* Role middleware
* Which APIs each role can access
* Patient ownership checks
* Dispatcher permissions
* Admin permissions
* Whether any unauthorized role can access protected APIs
* Whether Driver/Hospital have accidentally been implemented as extra primary RBAC roles
* Whether the implementation actually follows the assignment's 3-role requirement

Create a role-permission matrix.

==================================================
AUTHENTICATION AUDIT
====================

Verify:

* Register
* Login
* Password hashing
* JWT access token
* Refresh token
* Refresh token security
* Logout
* Token invalidation strategy
* Token expiration
* Bearer token middleware
* Protected routes
* Invalid token handling
* Expired token handling
* Password never returned
* Secret management

Test logically whether authentication is actually secure.

==================================================
EMERGENCY WORKFLOW AUDIT
========================

Verify the complete workflow:

Emergency Request
→ Priority
→ Find Available Ambulance
→ Dispatch
→ Driver Accepts
→ En Route
→ Patient Pickup
→ Hospital Selection
→ To Hospital
→ Hospital Arrival
→ Completed
→ Ambulance Available Again

Check whether each transition is actually implemented.

Verify:

* Valid transitions
* Invalid transitions rejected
* Role restrictions
* Database persistence
* Incident history
* Audit logs
* Ambulance status synchronization
* Assignment synchronization
* Hospital synchronization
* Resource release
* Cancellation
* Failure handling

Identify any state transition that can be skipped incorrectly.

==================================================
AMBULANCE DISPATCH / CONCURRENCY AUDIT
======================================

This is one of the most important parts.

Inspect the actual dispatch implementation.

Verify whether ambulance selection considers:

* availability
* operational status
* driver availability
* ambulance type
* required equipment
* priority
* distance where applicable
* existing active assignment

Then verify duplicate assignment prevention.

Specifically inspect whether the code has:

* Prisma transaction
* availability check INSIDE transaction
* atomic status update
* atomic assignment creation
* trip creation/update
* rollback
* conflict handling
* concurrency protection

Consider this scenario:

Request A and Request B simultaneously attempt to assign the same ambulance.

Expected:

Request A → SUCCESS
Request B → CONFLICT / REJECTED

Only one active assignment should exist.

Explain whether the current implementation actually guarantees this or merely appears to.

==================================================
PAYMENT AUDIT
=============

PAYMENT IS MANDATORY.

This requirement must NOT be skipped.

Verify whether the project integrates a REAL:

* bKash
  OR
* Stripe
  OR
* SSLCommerz

Do NOT accept:

* fake payment
* manually changing payment status
* mock gateway
* fake success endpoint
* hardcoded payment response

Verify:

* payment initiation
* real gateway request
* callback
* success
* cancellation
* failure
* webhook where supported
* payment verification
* transaction ID
* amount validation
* payment status persistence
* duplicate payment protection
* invalid callback protection
* payment-to-user relation
* payment-to-trip/emergency relation
* environment secrets
* no payment secret committed to Git

If payment is missing, explicitly mark the project as NOT 100% complete.

==================================================
DATABASE AUDIT
==============

Inspect Prisma schema and migrations.

Verify:

* User
* Patient/Caller
* Driver
* Ambulance
* Hospital
* EmergencyRequest
* Assignment
* Trip
* Notification
* IncidentHistory
* AuditLog
* Payment

Check:

* relations
* foreign keys
* indexes
* unique constraints
* enums
* timestamps
* deletedAt
* payment fields
* audit relationships
* incident relationships
* migration consistency
* nullable/required fields
* cascade behavior
* data integrity

Identify any schema design problems.

==================================================
SOFT DELETE AUDIT
=================

Verify actual implementation.

Check:

* deletedAt
* DELETE endpoints
* service logic
* deleted records excluded from normal queries
* related records handled correctly
* unique fields considered
* restore strategy
* admin authorization

Do NOT mark PASS merely because deletedAt exists.

==================================================
AUDIT LOG / INCIDENT HISTORY
============================

Verify whether important actions are actually persisted.

Audit logs should cover where applicable:

* user creation
* login/security events
* emergency creation
* priority change
* ambulance assignment
* driver acceptance
* status change
* hospital selection
* cancellation
* trip completion
* role change
* soft delete
* payment status change

Each log should identify:

* actor
* action
* entity
* entity ID
* previous value where appropriate
* new value where appropriate
* timestamp
* metadata/IP where appropriate

Also verify chronological IncidentHistory for each emergency.

==================================================
SECURITY AUDIT
==============

Inspect:

* bcrypt/password hashing
* JWT
* RBAC
* ownership checks
* Helmet
* CORS
* rate limiting
* input validation
* Prisma query safety
* environment variables
* secrets
* error messages
* production stack traces
* payment callback security

Look for real security vulnerabilities.

Do not just check whether a package is installed.

Verify whether it is actually configured and used.

==================================================
RATE LIMITING AUDIT
===================

Verify:

* global/API limiter
* authentication limiter
* windowMs
* max requests
* headers
* response
* Redis-backed store if required
* actual middleware application

Also check that error messages match the actual configured time window.

==================================================
VALIDATION AUDIT
================

Verify Zod/Joi validation for:

* body
* query
* params
* enums
* email
* password
* coordinates
* pagination
* payment
* status transitions

Check whether invalid input can bypass validation.

==================================================
API RESPONSE AUDIT
==================

Verify ALL endpoints follow:

Success:

{
"success": true,
"message": "...",
"data": {}
}

Error:

{
"success": false,
"message": "...",
"errors": []
}

Check:

* success format
* error format
* validation errors
* HTTP status codes
* production-safe errors
* Prisma errors
* authentication errors
* authorization errors
* conflict errors
* payment errors

==================================================
PAGINATION / FILTER / SORT / SEARCH
===================================

Find the actual implementation.

Verify:

Pagination:

* page
* limit
* total
* totalPages
* current page
* default limit
* maximum limit

Filtering:

* status
* priority
* date where relevant

Sorting:

* sortBy
* sortOrder
* allow-list
* SQL injection-safe implementation

Search:

* real database search
* validated query
* authorization
* meaningful domain fields

Do not mark PASS if these are only documented but not implemented.

==================================================
PERFORMANCE AUDIT
=================

Inspect:

* database indexes
* Prisma select
* Prisma include
* N+1 queries
* pagination
* search performance
* filtering
* transaction boundaries
* unnecessary database queries
* Redis usage where appropriate

Explain important performance problems.

==================================================
POSTMAN AUDIT
=============

Inspect the actual Postman collection.

Verify whether it contains:

* Auth
* Users/Profile
* Emergency Requests
* Ambulances
* Drivers
* Hospitals
* Trips
* Payments
* Notifications
* Admin
* Audit/Incident History

Verify environment variables:

* base_url
* access_token
* refresh_token
* patient_id
* dispatcher_id
* admin_id
* emergency_request_id
* ambulance_id
* driver_id
* hospital_id
* trip_id
* payment_id

Check whether the collection actually works with the current API routes.

Check:

* token extraction
* ID extraction
* assertions
* positive tests
* negative tests
* RBAC tests
* validation tests
* conflict tests
* pagination tests
* filtering tests
* search tests
* payment tests
* transition tests
* soft delete tests

==================================================
NEGATIVE TEST AUDIT
===================

Verify actual tests for:

* duplicate registration
* wrong password
* missing token
* invalid token
* wrong role
* invalid body
* invalid ID
* missing resource
* invalid transition
* unavailable ambulance
* duplicate ambulance assignment
* concurrent assignment
* unauthorized access
* soft-deleted resource
* invalid payment callback
* duplicate payment
* rate limit violation

==================================================
DEPLOYMENT AUDIT
================

Verify actual production deployment.

Check:

* production API URL
* database connection
* DATABASE_URL
* JWT secrets
* payment credentials
* CORS
* migrations
* health endpoint
* production API
* no localhost dependency
* no secrets in Git
* README production information

If production API routes differ from local routes, identify them.

==================================================
README / DOCUMENTATION AUDIT
============================

Verify README includes:

* project name
* objective
* features
* stack
* architecture
* database
* setup
* installation
* migrations
* seed
* local development
* API base URL
* authentication
* roles
* payment
* Postman
* deployment
* testing
* business rules
* dispatch logic
* concurrency explanation

==================================================
FINAL OUTPUT FORMAT
===================

After inspecting the complete project, produce the audit in this exact structure.

# 1. FINAL VERDICT

Choose exactly one:

* 100% COMPLETE
* NOT COMPLETE
* PARTIALLY COMPLETE
* CANNOT VERIFY

Then give a short explanation.

# 2. EXECUTIVE SUMMARY

Give:

* Total requirements checked
* PASS count
* PARTIAL count
* FAIL count
* MISSING count
* NOT VERIFIED count
* Estimated compliance percentage

Do NOT calculate 100% unless every mandatory requirement is actually verified.

# 3. REQUIREMENT-BY-REQUIREMENT AUDIT

Create a table:

| # | Requirement | Status | Evidence | Problem | Required Fix |
| - | ----------- | ------ | -------- | ------- | ------------ |

Every requirement from `Project Requirements.md` must appear.

Do NOT skip sections.

# 4. API AUDIT

Create:

| Method | Route | Auth | Role | Validation | DB Connected | Status | Evidence |
| ------ | ----- | ---- | ---- | ---------- | ------------ | ------ | -------- |

Also provide:

**Total meaningful APIs: X**

# 5. ROLE PERMISSION MATRIX

Create a table showing:

| Feature/API | PATIENT | DISPATCHER | ADMIN |
| ----------- | ------- | ---------- | ----- |

# 6. DATABASE AUDIT

List every required entity and its status.

# 7. AUTH & SECURITY AUDIT

Clearly identify vulnerabilities and weaknesses.

# 8. DISPATCH & CONCURRENCY AUDIT

Explain whether duplicate ambulance assignment is truly prevented under concurrent requests.

# 9. PAYMENT AUDIT

This must be explicitly reported.

If real payment integration does not exist:

**CRITICAL: PAYMENT REQUIREMENT NOT SATISFIED**

# 10. POSTMAN AUDIT

Show missing collections, variables and tests.

# 11. DEPLOYMENT AUDIT

Show production problems.

# 12. CRITICAL ISSUES

Rank issues:

🔴 CRITICAL
🟠 HIGH
🟡 MEDIUM
🟢 LOW

# 13. EXACT FIX PLAN

Give me a step-by-step implementation order.

Example:

1. Fix authentication
2. Fix RBAC
3. Fix payment
4. Fix dispatch transaction
5. Fix state transitions
6. Fix soft delete
7. Fix audit logs
8. Fix Postman
9. Fix deployment
10. Final QA

But determine the actual order based on the code.

# 14. FINAL 100% CHECKLIST

Create a final checklist containing every mandatory requirement.

Use:

✅ PASS
⚠️ PARTIAL
❌ FAIL
❌ MISSING
❓ NOT VERIFIED

# 15. DO NOT HIDE PROBLEMS

Be strict.

I do NOT want a polite review.

I want an evaluator-style technical audit.

If something is wrong, tell me directly.

If something is incomplete, tell me directly.

If something only looks implemented but is not actually functional, mark it accordingly.

If payment is fake, mark it as FAIL.

If concurrency is unsafe, mark it as FAIL.

If RBAC is weak, mark it as FAIL.

If an API exists but is not connected to the database, mark it as FAIL.

If a requirement cannot be verified from the available source code, mark it NOT VERIFIED.

Do not assume.

Do not skip.

Do not reduce the scope.

The final goal is to make sure this project is genuinely ready for submission and can satisfy 100% of the requirements.

# REST API Documentation

**Base URL:** `https://api.internshipplatform.com/api/v1`  
**Auth:** Bearer JWT in `Authorization` header OR HttpOnly cookie `access_token`  
**Content-Type:** `application/json` (unless multipart)

---

## Standard Response Envelope

```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

**Error envelope:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [{ "field": "email", "message": "Invalid email" }]
  }
}
```

---

## Global Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing/invalid token |
| 401 | `TOKEN_EXPIRED` | Access token expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource |
| 423 | `ACCOUNT_LOCKED` | Too many failed logins |
| 429 | `RATE_LIMIT_EXCEEDED` | Throttled |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Authentication APIs

### POST `/auth/register`

**Body:**
```json
{
  "email": "student@university.edu",
  "password": "SecurePass1!",
  "role": "student",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| email | valid email, max 255 |
| password | min 8, upper, lower, digit, special |
| role | enum: student, company_hr |
| firstName, lastName | required if student |

**Response 201:**
```json
{
  "success": true,
  "data": { "userId": "...", "message": "Verification email sent" }
}
```

---

### POST `/auth/login`

**Body:** `{ "email", "password", "mfaCode?" }`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id", "email", "role", "firstName" },
    "requiresMfa": false
  }
}
```
Sets cookies: `access_token` (15m), `refresh_token` (7d, path=/auth/refresh)

---

### POST `/auth/refresh-token`

**Body:** none (refresh cookie required)

**Response 200:** New access token + rotated refresh cookie

**Errors:** `401 REFRESH_INVALID`, `401 REFRESH_REUSE_DETECTED` (revokes family)

---

### POST `/auth/logout`

**Auth required.** Invalidates session family.

---

### POST `/auth/forgot-password`

**Body:** `{ "email" }`  
**Response 200:** Always success (no email enumeration)

---

### POST `/auth/reset-password`

**Body:** `{ "token", "password" }`  
**Validation:** token valid, not expired; password rules same as register

---

### POST `/auth/verify-email`

**Body:** `{ "token" }`

---

### POST `/auth/verify-otp`

**Body:** `{ "email", "otp" }` — for phone/email OTP flows

---

### POST `/auth/mfa/setup` | `/auth/mfa/verify` | `/auth/mfa/disable`

TOTP standard (RFC 6238). Backup codes on setup.

---

### GET `/auth/oauth/google` | `/auth/oauth/linkedin`

Redirect to IdP. Callback: `/auth/oauth/:provider/callback`

---

### GET `/auth/sessions` | DELETE `/auth/sessions/:id`

Device/session management.

---

## Users & Profiles

### GET `/users/me`

**Response:** User + role-specific profile embedded

### PUT `/users/me`

Update name, phone, preferences.

### PUT `/students/profile`

**Body:** skills, bio, university, portfolioLinks, location

### POST `/students/resume/upload-url`

**Response:** `{ "uploadUrl", "key", "expiresIn": 300 }`

### PUT `/students/resume/confirm`

**Body:** `{ "key" }` — confirms S3 upload, triggers scan job

---

## Companies

### POST `/companies`

**Role:** company_hr. Creates pending company.

### GET `/companies/:id`

Public profile if approved.

### PUT `/companies/:id`

**Role:** company_hr (own org)

### POST `/admin/companies/:id/approve`

**Role:** admin. Body: `{ "approved": true, "note?" }`

---

## Internships

### GET `/internships`

**Query:** `page`, `limit`, `q`, `skills`, `type`, `location`, `stipendMin`, `sort`

**Response 200:**
```json
{
  "data": [{
    "id", "title", "company": { "name", "logoUrl" },
    "skills", "type", "stipend", "deadline", "openings"
  }],
  "meta": { "page", "limit", "total" }
}
```

### GET `/internships/:id`

### POST `/internships`

**Role:** company_hr. Status defaults to `draft`.

### PUT `/internships/:id`

**Role:** company_hr (owner)

### DELETE `/internships/:id`

Soft delete → status `archived`

### POST `/internships/:id/submit-for-review`

### POST `/admin/internships/:id/approve`

**Body:** `{ "approved": boolean, "rejectionReason?" }`

---

## Applications

### POST `/applications`

**Role:** student  
**Body:** `{ "internshipId", "coverLetter?" }`

**Errors:** `409 ALREADY_APPLIED`, `400 INTERNSHIP_CLOSED`

### GET `/applications`

**Query:** `status`, `page` — scoped by role

### GET `/applications/:id`

### PATCH `/applications/:id/status`

**Role:** company_hr  
**Body:** `{ "status", "note?" }`  
Valid transitions enforced by state machine

### POST `/applications/:id/withdraw`

**Role:** student (own, before accepted)

### POST `/applications/:id/interviews`

**Body:** `{ "scheduledAt", "mode": "video|phone|onsite", "meetingLink?" }`

### POST `/applications/:id/offer`

**Body:** `{ "stipend", "startDate", "expiresAt" }`

### POST `/applications/:id/accept-offer` | `/decline-offer`

**Role:** student

### POST `/applications/:id/assign-mentor`

**Body:** `{ "mentorId" }`

---

## Tasks

### GET `/tasks`

**Query:** `applicationId`, `status`, `assignedTo`

### POST `/tasks`

**Role:** mentor, company_hr  
**Body:**
```json
{
  "applicationId": "...",
  "title": "Week 1 Report",
  "description": "...",
  "deadline": "2026-06-15T23:59:59Z",
  "priority": "medium"
}
```

### GET `/tasks/:id`

### POST `/tasks/:id/upload-url`

Presigned URLs for submission files.

### POST `/tasks/:id/submit`

**Role:** student  
**Body:** `{ "notes", "fileKeys": ["..."] }`

### POST `/tasks/:id/review`

**Role:** mentor  
**Body:** `{ "status": "approved|rejected|revision_requested", "feedback", "rating": 1-5 }`

---

## Attendance

### POST `/attendance/check-in`

**Body:** `{ "applicationId", "geo?" }`

### POST `/attendance/check-out`

### GET `/attendance`

**Query:** `applicationId`, `from`, `to`

### GET `/attendance/report`

**Role:** mentor, company_hr — aggregated stats

---

## Evaluations

### POST `/evaluations`

**Body:** applicationId, type, skillScores, overallRating, comments

### GET `/evaluations`

**Query:** `applicationId`, `type`

### GET `/evaluations/:id`

---

## Certificates

### POST `/certificates`

**Role:** company_hr — triggers PDF generation

### GET `/certificates/:certificateId/verify`

**Public** — returns validity + redacted details

### GET `/students/certificates`

Download links for own certificates

### POST `/admin/certificates/:id/revoke`

---

## Notifications

### GET `/notifications`

**Query:** `unreadOnly`, `page`

### PATCH `/notifications/:id/read`

### PATCH `/notifications/read-all`

### PUT `/notifications/preferences`

**Body:** `{ "email": true, "sms": false, "push": true, "types": {...} }`

---

## Admin

### GET `/admin/users`

**Query:** `role`, `status`, `q`, `page`

### PATCH `/admin/users/:id/status`

**Body:** `{ "status": "suspended|active" }`

### GET `/admin/analytics/overview`

**Response:** users, applications, placements, revenue metrics

### GET `/admin/analytics/export`

**Query:** `type`, `from`, `to` — returns CSV URL

### GET `/admin/audit-logs`

---

## Health

### GET `/health` — liveness  
### GET `/health/ready` — checks MongoDB + Redis

---

## Rate Limits

| Endpoint group | Limit |
|----------------|-------|
| `/auth/login` | 10/min per IP |
| `/auth/register` | 5/min per IP |
| `/auth/forgot-password` | 3/hour per email |
| General API | 100/min per user |
| File upload URL | 20/hour per user |

---

## Versioning

- URL prefix `/api/v1`
- Deprecation header `Sunset` + `Link` for v2 migration

# MongoDB Schema Design

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENTS : extends
    USERS ||--o| MENTORS : extends
    USERS }o--|| COMPANIES : belongs_to
    COMPANIES ||--o{ INTERNSHIPS : posts
    INTERNSHIPS ||--o{ APPLICATIONS : receives
    STUDENTS ||--o{ APPLICATIONS : submits
    APPLICATIONS ||--o| INTERNSHIPS : for
    APPLICATIONS ||--o{ TASKS : generates
    MENTORS ||--o{ TASKS : assigns
    APPLICATIONS ||--o{ ATTENDANCE : tracks
    APPLICATIONS ||--o{ EVALUATIONS : has
    APPLICATIONS ||--o| CERTIFICATES : earns
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : triggers

    USERS {
        ObjectId _id PK
        string email UK
        string role
        string status
    }
    COMPANIES {
        ObjectId _id PK
        string name
        string approvalStatus
    }
    INTERNSHIPS {
        ObjectId _id PK
        ObjectId companyId FK
        string status
    }
    APPLICATIONS {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId internshipId FK
        string status UK_pair
    }
```

---

## 2. Collection Schemas

### 2.1 `users`

| Field | Type | Validation | Index |
|-------|------|------------|-------|
| `_id` | ObjectId | auto | PK |
| `email` | String | required, lowercase, email | unique |
| `passwordHash` | String | required if local auth | — |
| `role` | Enum | `admin`, `company_hr`, `mentor`, `student` | compound with status |
| `status` | Enum | `active`, `pending_verification`, `suspended` | yes |
| `emailVerified` | Boolean | default false | — |
| `mfaEnabled` | Boolean | default false | — |
| `mfaSecret` | String | encrypted | — |
| `oauthProviders` | Array | `{ provider, providerId }` | sparse on providerId |
| `companyId` | ObjectId | ref companies, required if HR/mentor | index |
| `lastLoginAt` | Date | — | — |
| `failedLoginAttempts` | Number | default 0 | — |
| `lockUntil` | Date | nullable | TTL sparse |
| `refreshTokenFamily` | String | UUID for rotation | — |
| `createdAt`, `updatedAt` | Date | timestamps | — |

```javascript
// Mongoose example
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ['admin','company_hr','mentor','student'], required: true },
  status: { type: String, enum: ['active','pending_verification','suspended'], default: 'pending_verification' },
  emailVerified: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ companyId: 1 });
```

---

### 2.2 `companies`

| Field | Type | Validation | Index |
|-------|------|------------|-------|
| `_id` | ObjectId | PK | — |
| `name` | String | required, 2-200 chars | text |
| `slug` | String | unique, kebab-case | unique |
| `description` | String | max 5000 | — |
| `website` | String | URL | — |
| `logoUrl` | String | S3 URL | — |
| `industry` | String | — | index |
| `size` | Enum | `1-10`, `11-50`, ... | — |
| `approvalStatus` | Enum | `pending`, `approved`, `rejected` | index |
| `approvedBy` | ObjectId | ref users | — |
| `approvedAt` | Date | — | — |
| `documents` | Array | `{ type, url, verified }` | — |
| `settings` | Object | notification prefs | — |
| `createdAt`, `updatedAt` | Date | — | — |

---

### 2.3 `students`

| Field | Type | Validation | Index |
|-------|------|------------|-------|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | ref users, unique | unique |
| `firstName`, `lastName` | String | required | text |
| `phone` | String | E.164 optional | — |
| `university` | String | — | index |
| `graduationYear` | Number | 2020-2035 | — |
| `skills` | [String] | max 30, each max 50 chars | multikey |
| `resume` | Object | `{ key, url, uploadedAt, version }` | — |
| `portfolioLinks` | [String] | URL validated | — |
| `bio` | String | max 1000 | — |
| `location` | Object | `{ city, state, country, geo }` | 2dsphere optional |
| `preferences` | Object | remote, stipend min, domains | — |

---

### 2.4 `mentors`

| Field | Type | Index |
|-------|------|-------|
| `userId` | ObjectId | unique |
| `companyId` | ObjectId | index |
| `department` | String | — |
| `expertise` | [String] | multikey |
| `assignedInternIds` | [ObjectId] | applications ref |

---

### 2.5 `internships`

| Field | Type | Validation | Index |
|-------|------|------------|-------|
| `_id` | ObjectId | PK | — |
| `companyId` | ObjectId | required | index |
| `title` | String | required | text |
| `slug` | String | unique per company | compound unique |
| `description` | String | required | text |
| `requirements` | [String] | — | — |
| `skills` | [String] | — | multikey |
| `type` | Enum | `remote`, `hybrid`, `onsite` | index |
| `location` | Object | — | 2dsphere |
| `stipend` | Object | `{ min, max, currency }` | — |
| `durationWeeks` | Number | 1-52 | — |
| `openings` | Number | min 1 | — |
| `applicationDeadline` | Date | future on publish | TTL optional |
| `status` | Enum | `draft`, `pending_review`, `published`, `closed`, `rejected` | compound |
| `publishedAt` | Date | — | — |
| `moderatedBy` | ObjectId | — | — |
| `viewCount` | Number | default 0 | — |
| `applicationCount` | Number | denormalized | — |

**Indexes:**
```javascript
internshipSchema.index({ companyId: 1, slug: 1 }, { unique: true });
internshipSchema.index({ status: 1, publishedAt: -1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ title: 'text', description: 'text' });
```

---

### 2.6 `applications`

| Field | Type | Validation | Index |
|-------|------|------------|-------|
| `_id` | ObjectId | PK | — |
| `studentId` | ObjectId | ref students | compound |
| `internshipId` | ObjectId | ref internships | compound |
| `companyId` | ObjectId | denormalized | index |
| `status` | Enum | pipeline states | index |
| `coverLetter` | String | max 2000 | — |
| `resumeSnapshot` | Object | copy at apply time | — |
| `mentorId` | ObjectId | nullable | index |
| `interviews` | Array | `{ scheduledAt, mode, notes, outcome }` | — |
| `offer` | Object | `{ stipend, startDate, expiresAt }` | — |
| `statusHistory` | Array | `{ status, by, at, note }` | — |
| `appliedAt` | Date | default now | — |

**Unique constraint:** `{ studentId: 1, internshipId: 1 }` unique

---

### 2.7 `tasks`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `applicationId` | ObjectId | index |
| `assignedBy` | ObjectId | mentor/HR userId |
| `assignedTo` | ObjectId | student userId |
| `title` | String | — |
| `description` | String | — |
| `deadline` | Date | index |
| `status` | Enum | `pending`, `submitted`, `under_review`, `approved`, `rejected`, `revision_requested` |
| `submission` | Object | `{ files[], notes, submittedAt }` |
| `review` | Object | `{ rating, feedback, reviewedAt, reviewedBy }` |
| `priority` | Enum | low, medium, high | — |

---

### 2.8 `evaluations`

| Field | Type |
|-------|------|
| `applicationId` | ObjectId (index) |
| `evaluatorId` | ObjectId |
| `type` | `weekly`, `monthly`, `final` |
| `periodStart`, `periodEnd` | Date |
| `skillScores` | `[{ skill, score 1-5 }]` |
| `overallRating` | Number 1-5 |
| `comments` | String |
| `goals` | [String] |

---

### 2.9 `attendance`

| Field | Type | Index |
|-------|------|-------|
| `applicationId` | ObjectId | compound |
| `date` | Date (day precision) | compound unique |
| `checkIn` | Date | — |
| `checkOut` | Date | — |
| `totalMinutes` | Number | — |
| `status` | Enum | `present`, `absent`, `half_day`, `leave` |
| `geo` | Object | optional |

**Unique:** `{ applicationId: 1, date: 1 }`

---

### 2.10 `notifications`

| Field | Type | Index |
|-------|------|-------|
| `userId` | ObjectId | compound with createdAt |
| `type` | String | — |
| `title`, `body` | String | — |
| `data` | Object | entity refs |
| `channels` | Array | email, sms, push, in_app |
| `read` | Boolean | index partial unread |
| `createdAt` | Date | TTL 90 days optional |

---

### 2.11 `certificates`

| Field | Type | Index |
|-------|------|-------|
| `certificateId` | String UUID | unique |
| `applicationId` | ObjectId | unique |
| `studentId` | ObjectId | index |
| `companyId` | ObjectId | — |
| `issuedBy` | ObjectId | — |
| `pdfUrl` | String | — |
| `qrCodeUrl` | String | — |
| `verificationHash` | String | unique |
| `status` | Enum | `active`, `revoked` |
| `revokedAt`, `revokeReason` | — | — |
| `issuedAt` | Date | — |

---

### 2.12 `audit_logs`

| Field | Type | Index |
|-------|------|-------|
| `actorId` | ObjectId | index |
| `action` | String | — |
| `resource` | String | — |
| `resourceId` | ObjectId | — |
| `ip`, `userAgent` | String | — |
| `metadata` | Object | — |
| `createdAt` | Date | TTL 365d |

---

## 3. Indexing Strategy Summary

| Collection | Index | Purpose |
|------------|-------|---------|
| users | `{ email: 1 }` unique | Login lookup |
| internships | `{ status: 1, publishedAt: -1 }` | Listing feed |
| internships | text on title, description | Search |
| applications | `{ studentId, internshipId }` unique | Prevent duplicate apply |
| applications | `{ companyId, status }` | HR pipeline |
| tasks | `{ applicationId, deadline }` | Task board |
| notifications | `{ userId, read, createdAt }` | Inbox |
| audit_logs | TTL on createdAt | Compliance retention |

---

## 4. Sharding Strategy (1M+ users)

**Shard key selection:**

| Collection | Shard Key | Rationale |
|------------|-----------|-----------|
| `users` | `{ _id: "hashed" }` | Even distribution; lookups by _id |
| `applications` | `{ companyId: 1, _id: 1 }` | Company-scoped queries localized |
| `internships` | `{ companyId: 1, _id: 1 }` | Same |
| `notifications` | `{ userId: 1, _id: 1 }` | User inbox on single shard |
| `audit_logs` | `{ createdAt: 1, _id: 1 }` | Time-range queries |

**Zones:** Hot companies may get dedicated zone shards in Phase 3.

---

## 5. Query Optimization Patterns

1. **Denormalize** `companyId` on applications for HR dashboards (avoid $lookup)
2. **Project** only needed fields in list endpoints
3. **Cursor pagination** (`_id` + `createdAt`) over skip/limit for deep pages
4. **Read preference** `secondaryPreferred` for analytics reads
5. **Aggregation pipelines** pre-compute daily stats → `analytics_daily`
6. **Redis cache** internship list pages (invalidate on publish)

---

## 6. Backup & DR

- MongoDB Atlas: continuous backup, point-in-time restore (7-30 days)
- Cross-region replica (Phase 3) for RPO < 1 min
- S3 versioning + cross-region replication for files
- Quarterly restore drills documented in runbook

# User Stories & Acceptance Criteria

Format: **As a** [role], **I want** [goal], **so that** [benefit].

---

## Epic E1: Authentication & Identity

### US-E1-01 — Student Registration
**As a** student, **I want** to register with email and password, **so that** I can access the platform.

**Acceptance Criteria:**
- Given valid email/password, when I submit registration, then account is created with role `student` and status `pending_verification`
- Given duplicate email, then HTTP 409 with code `EMAIL_EXISTS`
- Given weak password (< 8 chars, no upper/lower/digit), then validation error
- Verification email sent within 30s (async queue)

### US-E1-02 — Login with JWT
**As a** user, **I want** to log in securely, **so that** I receive access and refresh tokens.

**Acceptance Criteria:**
- Access token TTL 15m; refresh token TTL 7d with rotation
- Tokens stored in HttpOnly Secure SameSite=Strict cookies
- Failed attempts tracked; lockout after 5 failures for 15m

### US-E1-03 — OAuth Google/LinkedIn
**As a** user, **I want** social login, **so that** onboarding is faster.

**Acceptance Criteria:**
- OAuth links or creates user by verified email
- Role selected on first OAuth login if new user

### US-E1-04 — MFA
**As a** user, **I want** TOTP MFA, **so that** my account is more secure.

**Acceptance Criteria:**
- QR setup, backup codes (10), verify on login when enabled

---

## Epic E2: Student Experience

### US-E2-01 — Profile & Resume
**As a** student, **I want** to upload my resume and skills, **so that** companies can evaluate me.

**Acceptance Criteria:**
- PDF/DOCX max 5MB; virus scan before available
- Skills as tags (max 30); portfolio URLs validated

### US-E2-02 — Search Internships
**As a** student, **I want** to search and filter internships, **so that** I find relevant roles.

**Acceptance Criteria:**
- Filters: location, remote, skills, stipend range, duration
- Pagination 20/page; results < 500ms P95 (cached popular queries)

### US-E2-03 — Apply
**As a** student, **I want** to apply once per internship, **so that** my candidacy is tracked.

**Acceptance Criteria:**
- One application per student+internship (unique compound index)
- Status starts at `applied`; confirmation notification sent

### US-E2-04 — Task Submission
**As a** student, **I want** to submit task deliverables, **so that** mentors can review.

**Acceptance Criteria:**
- Upload files to S3 presigned URL; metadata saved on submission
- Late submission flagged if past deadline

---

## Epic E3: Company HR

### US-E3-01 — Company Onboarding
**As a** company HR, **I want** to register my organization, **so that** I can post internships after approval.

**Acceptance Criteria:**
- Company status `pending` until admin approves
- Cannot publish internships while pending

### US-E3-02 — Post Internship
**As a** company HR, **I want** to create internship listings, **so that** students can apply.

**Acceptance Criteria:**
- Draft → submit for review → admin publishes
- Required fields: title, description, skills, duration, location, openings

### US-E3-03 — Applicant Pipeline
**As a** company HR, **I want** a kanban/list of applicants by status, **so that** I can manage hiring.

**Acceptance Criteria:**
- Bulk shortlist/reject with reason (optional)
- Interview slot proposal sends notification to student

### US-E3-04 — Assign Mentor
**As a** company HR, **I want** to assign a mentor to an accepted intern, **so that** supervision is clear.

**Acceptance Criteria:**
- Mentor must belong to same company
- Intern sees mentor on dashboard after assignment

---

## Epic E4: Mentor

### US-E4-01 — View Assigned Interns
**As a** mentor, **I want** to see my interns, **so that** I can manage them.

### US-E4-02 — Assign Tasks
**As a** mentor, **I want** to create tasks with deadlines, **so that** interns know expectations.

### US-E4-03 — Review & Feedback
**As a** mentor, **I want** to approve/reject submissions with comments, **so that** interns improve.

---

## Epic E5: Admin

### US-E5-01 — Approve Companies
**As an** admin, **I want** to verify companies, **so that** only legitimate employers list roles.

### US-E5-02 — Moderate Internships
**As an** admin, **I want** to approve/reject listings, **so that** content quality is maintained.

### US-E5-03 — Analytics Dashboard
**As an** admin, **I want** placement and application metrics, **so that** I can report to stakeholders.

**Acceptance Criteria:**
- Charts: applications over time, conversion funnel, top companies
- Export CSV for date range

### US-E5-04 — Suspend User
**As an** admin, **I want** to suspend accounts, **so that** abuse is stopped.

**Acceptance Criteria:**
- Suspended users cannot refresh tokens; active sessions invalidated via Redis blocklist

---

## Epic E6: Notifications

### US-E6-01 — Multi-channel Alerts
**As a** user, **I want** notifications for application updates, **so that** I stay informed.

**Events:** application_status_changed, task_assigned, task_reviewed, interview_scheduled, certificate_issued

---

## Epic E7: Certificates (Phase 2)

### US-E7-01 — Digital Certificate
**As a** student, **I want** a verifiable certificate, **so that** I can prove completion.

**Acceptance Criteria:**
- PDF with unique ID + QR linking to public verify endpoint
- Admin/HR can revoke with reason

---

## Story Mapping to MVP Phases

| Phase | Stories |
|-------|---------|
| MVP | E1-01,02; E2-01,02,03,04; E3-01,02,03; E6-01 |
| Phase 2 | E3-04; E4-*; E5-01,02; E7-01; attendance epics |
| Phase 3 | E5-03 advanced; recommendation; AI features |

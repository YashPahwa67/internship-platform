# Product Requirements Document (PRD)
## Internship Management Platform (IMP)

**Version:** 1.0  
**Status:** Approved for MVP  
**Owner:** Product  
**Last Updated:** June 2026

---

## 1. Executive Summary

IMP is a cloud-native B2B2C SaaS platform that centralizes the full internship lifecycle: discovery, application, onboarding, task execution, evaluation, certification, and analytics. It serves four primary personas with strict RBAC and auditability.

**Problem:** Students, companies, and mentors coordinate internships across email, spreadsheets, and disjoint tools—leading to lost applications, opaque progress, and poor placement analytics.

**Solution:** A single platform with role-specific dashboards, workflow automation, notifications, and verifiable digital certificates.

**Success Metrics (12 months post-MVP):**
| Metric | Target |
|--------|--------|
| Monthly Active Students | 50,000 |
| Company onboarding (verified) | 500 |
| Application-to-offer conversion tracked | 100% |
| Platform availability | 99.9% |
| P95 API latency | < 300ms |
| NPS (Students) | ≥ 40 |

---

## 2. Goals & Non-Goals

### Goals
- End-to-end internship workflow for all four roles
- Production-grade security (JWT, MFA, OAuth, audit logs)
- Horizontal scalability to 1M+ users
- Admin moderation and analytics
- Multi-channel notifications

### Non-Goals (MVP)
- AI resume screening, recommendation engine
- Video interviews, blockchain certificates
- Native mobile apps (responsive web only)
- Multi-tenant white-label branding

---

## 3. Personas

| Persona | Goals | Pain Points |
|---------|-------|-------------|
| **Student** | Find internships, track applications, complete tasks | Fragmented apply process, no feedback loop |
| **Company HR** | Post roles, hire, evaluate, certify | Manual screening, no intern performance view |
| **Mentor** | Guide interns, assign/review work | No structured task/attendance tooling |
| **Admin** | Govern platform, moderate, report | Fraudulent listings, unverified companies |

---

## 4. Functional Requirements by Module

### 4.1 User Management
| ID | Requirement | Priority |
|----|-------------|----------|
| UM-01 | Email/password registration with verification | P0 |
| UM-02 | OAuth (Google, LinkedIn) | P1 |
| UM-03 | Profile CRUD per role (student skills, company profile) | P0 |
| UM-04 | Resume upload (PDF, max 5MB) to S3 | P0 |
| UM-05 | Admin suspend/activate users | P0 |
| UM-06 | MFA (TOTP) optional/enforced per policy | P1 |

### 4.2 Internship Management
| ID | Requirement | Priority |
|----|-------------|----------|
| IM-01 | Company creates draft internship | P0 |
| IM-02 | Admin approves/publishes internship | P0 |
| IM-03 | Search, filter, paginate listings | P0 |
| IM-04 | Recommendation engine | P3 |

### 4.3 Application Management
| ID | Requirement | Priority |
|----|-------------|----------|
| AM-01 | Student applies with cover letter + resume ref | P0 |
| AM-02 | Status pipeline: Applied → Shortlisted → Interview → Offer → Accepted/Rejected | P0 |
| AM-03 | Withdraw application | P0 |
| AM-04 | Interview scheduling | P1 |

### 4.4 Task Management
| ID | Requirement | Priority |
|----|-------------|----------|
| TM-01 | Mentor/HR creates tasks for intern | P0 |
| TM-02 | Student submits files + notes | P0 |
| TM-03 | Review workflow with feedback | P0 |

### 4.5 Attendance (Phase 2)
| ID | Requirement | Priority |
|----|-------------|----------|
| AT-01 | Daily check-in/out with geo optional | P2 |
| AT-02 | Attendance reports | P2 |

### 4.6 Performance & Certificates
| ID | Requirement | Priority |
|----|-------------|----------|
| EV-01 | Mentor evaluations (weekly/monthly) | P2 |
| CE-01 | Auto PDF certificate + QR verification | P2 |

### 4.7 Notifications
| ID | Requirement | Priority |
|----|-------------|----------|
| NT-01 | In-app + email for key events | P0 |
| NT-02 | SMS, push | P1/P2 |

### 4.8 Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| AN-01 | Admin dashboards (users, applications, placements) | P1 |
| AN-02 | Company intern reports | P1 |

---

## 5. RBAC Matrix

| Resource | Admin | Company HR | Mentor | Student |
|----------|:-----:|:----------:|:------:|:-------:|
| All users | CRUD | — | — | Own |
| Companies | Approve | Own org | Read assigned | — |
| Internships | Moderate | CRUD own | Read | Read published |
| Applications | Read all | CRUD own postings | Read assigned | CRUD own |
| Tasks | Read | CRUD org | CRUD assigned | Submit own |
| Evaluations | Read | Read org | CRUD | Read own |
| Certificates | Revoke | Issue org | — | Download own |
| Analytics | Full | Org scope | Team scope | Own stats |
| Settings | Full | Org prefs | — | Profile |

**Permission model:** `resource:action:scope`  
Example: `internship:create:company`, `application:update:own`

---

## 6. User Journeys (Happy Path)

### Student
Register → Verify email → Complete profile → Search internships → Apply → Track status → Accept offer → Complete tasks → Receive evaluation → Download certificate

### Company HR
Register → Admin approves company → Post internship → Admin publishes → Review applicants → Shortlist → Schedule interview → Offer → Assign mentor → Evaluate → Generate certificate

### Mentor
Login → View assigned interns → Create tasks → Review submissions → Rate performance → Submit weekly review

### Admin
Login → Approve companies/internships → Monitor analytics → Moderate content → Manage notifications templates

---

## 7. Constraints & Assumptions

- **Assumption:** Single region (AWS ap-south-1) MVP; multi-region Phase 3
- **Constraint:** GDPR-ready data export/delete on request
- **Constraint:** All PII encrypted at rest (MongoDB CSFLE optional Phase 2)
- **Assumption:** Companies are B2B customers; students are free tier

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fake companies | High | Manual approval + document verification |
| Resume malware | Medium | ClamAV scan on S3 upload |
| Token theft | High | HttpOnly cookies, rotation, short TTL |
| DB hot shards | Medium | Shard key design, read replicas, cache |

---

## 9. Release Criteria (MVP)

- [ ] Auth: register, login, refresh, forgot password
- [ ] Student + Company dashboards
- [ ] Internship CRUD + admin approval
- [ ] Application flow end-to-end
- [ ] Task create/submit/review
- [ ] Email + in-app notifications
- [ ] CI/CD to staging with smoke tests
- [ ] Security scan pass (OWASP ZAP baseline)

---

## 10. Open Questions

1. Revenue model: per-seat company subscription vs per-placement fee?
2. Mandatory MFA for Company HR at launch?
3. International internships (multi-currency, visa fields)?

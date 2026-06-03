# MVP Roadmap & Future Enhancements

---

## Phase 1 — MVP (8–10 weeks)

**Goal:** Prove core marketplace loop — post, apply, work, notify.

| Week | Deliverable |
|------|-------------|
| 1-2 | Project setup, auth (register/login/refresh/forgot), CI/CD skeleton |
| 3 | Student profile, resume upload, company registration + admin approval |
| 4 | Internship CRUD, admin moderation, public listing + search |
| 5 | Application flow (apply, withdraw, status updates) |
| 6 | Company applicant management, shortlist/reject |
| 7 | Task create, submit, review |
| 8 | Email + in-app notifications |
| 9-10 | QA, security hardening, staging → production deploy |

### MVP Feature Checklist
- [x] Registration/Login (JWT + cookies)
- [x] Student Dashboard
- [x] Company Dashboard
- [x] Internship Posting + approval
- [x] Internship Application
- [x] Task Submission
- [x] Notifications (email + in-app)

### MVP Out of Scope
- Mentor module, attendance, evaluations, certificates
- OAuth, MFA (stub only if time permits)
- Analytics beyond basic counters
- SMS/push

---

## Phase 2 — Operations (6 weeks)

| Feature | Value |
|---------|-------|
| Mentor management & assignment | Structured intern supervision |
| Evaluations (weekly/monthly) | Performance tracking |
| Attendance check-in/out | Compliance & reporting |
| Certificate generation + QR verify | Completion proof |
| Interview scheduling | Hiring workflow completion |
| OAuth + MFA | Enterprise security |

---

## Phase 3 — Intelligence & Scale (8+ weeks)

| Feature | Value |
|---------|-------|
| Recommendation engine | Match students to internships |
| AI resume screening | HR efficiency |
| Advanced analytics | Business intelligence |
| Microservice extraction | Independent scaling |
| Multi-region deployment | Global users |

---

## Future Enhancements (Backlog)

| Enhancement | Description | Tech |
|-------------|-------------|------|
| AI Resume Analyzer | Parse resume, extract skills, score fit | OpenAI / custom NLP |
| AI Interview Prep | Mock questions per role | LLM + RAG |
| AI Career Guidance | Personalized learning paths | Recommendation + content graph |
| AI Skill Gap Analysis | Compare profile vs job requirements | Embeddings |
| AI Internship Recommendations | Collaborative + content filtering | ML pipeline, feature store |
| Video Interviews | Embedded Zoom/Teams/WebRTC | Twilio / Daily.co |
| Blockchain Certificates | Immutable verification on chain | Polygon / Hyperledger |

---

## Team Composition (Suggested)

| Role | MVP | Phase 2+ |
|------|-----|----------|
| Backend | 2 | 2-3 |
| Frontend | 2 | 2 |
| DevOps | 0.5 | 1 |
| QA | 1 | 1 |
| PM/Design | 1 | 1 |

---

## Success Gates Between Phases

**MVP → Phase 2:**
- 100+ active students, 10+ verified companies
- < 0.1% error rate on core APIs
- Security review passed

**Phase 2 → Phase 3:**
- 50+ active internships completed end-to-end
- Certificate verification used > 80% of completions
- Mentor NPS ≥ 30

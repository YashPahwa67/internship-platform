# Technical Summary: Scalability, NFRs & Complete Documentation Index

---

## 1. Scalability Strategy (1M+ Users)

### Horizontal Scaling
| Tier | Strategy |
|------|----------|
| Frontend | Static on S3 + CloudFront; global edge |
| API | Stateless pods, HPA 2–50+, no in-memory session |
| Workers | Separate deployment, scale on queue depth |
| MongoDB | Sharded cluster; compound shard keys per collection |
| Redis | Cluster mode; separate instances for cache vs queues |

### Load Balancing
- ALB → NGINX Ingress → round-robin pods
- Sticky sessions **not** required (JWT stateless)
- WebSocket (future chat): ALB connection stickiness

### Microservice-Ready Decomposition
```
Phase 1: Modular monolith (current)
Phase 2: Extract Notification Service
Phase 3: Extract Auth Service + API Gateway (Kong/AWS)
Phase 4: Search Service (Elasticsearch/OpenSearch)
```

### Event-Driven Architecture
- Domain events via Redis Streams → workers
- Idempotent consumers with `eventId` dedup table
- Dead-letter queue for failed jobs (3 retries, exponential backoff)

---

## 2. Non-Functional Requirements

### Performance
| Target | Measure |
|--------|---------|
| P95 API latency | < 300ms reads, < 500ms writes |
| Page LCP | < 2.5s |
| Search | < 500ms with cache |

**Techniques:** Redis cache (5m TTL listings), gzip/brotli, pagination max 100, CDN for assets, DB projection, connection pooling (max 100/pod)

### Reliability
| Target | Implementation |
|--------|----------------|
| Availability | 99.9% (~8.7h downtime/year) |
| Multi-AZ | EKS nodes + Atlas replica set |
| Backups | Continuous + PITR |
| DR | Runbook, quarterly restore test |

### Maintainability
- Clean architecture layers
- 80%+ unit coverage on services
- OpenAPI spec auto-generated from routes
- Conventional commits + semantic versioning

### Observability
- Structured JSON logs with `requestId`
- RED metrics: Rate, Errors, Duration per endpoint
- Distributed tracing on critical paths (auth, apply, pay future)
- Alerts: PagerDuty P1 for outage, P2 for elevated errors

---

## 3. Capacity Planning (Rough)

| Users | API Pods | MongoDB | Redis |
|-------|----------|---------|-------|
| 10K MAU | 2-4 | M10 | 1GB |
| 100K MAU | 8-12 | M30 sharded | 4GB cluster |
| 1M MAU | 30-50 | M50+ multi-shard | 16GB cluster |

**Assumption:** 10% DAU, 20 API calls/session average.

---

## 4. Complete Documentation Deliverables

| # | Deliverable | Location |
|---|-------------|----------|
| 1 | PRD | [01-PRD.md](./01-PRD.md) |
| 2 | User Stories | [02-USER-STORIES.md](./02-USER-STORIES.md) |
| 3 | Use Case + Workflow Diagrams | [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md) |
| 4 | Workflow Diagrams | [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md) |
| 5 | Wireframes | [11-WIREFRAMES.md](./11-WIREFRAMES.md) |
| 6 | High-Level Architecture | [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md) + Canvas |
| 7 | Low-Level Design | [03-SYSTEM-DESIGN.md](./03-SYSTEM-DESIGN.md) |
| 8 | MongoDB Schema | [04-DATABASE.md](./04-DATABASE.md) |
| 9 | REST API Docs | [05-API.md](./05-API.md) |
| 10 | Frontend Structure | [06-FRONTEND.md](./06-FRONTEND.md) |
| 11 | Backend Structure | [07-BACKEND.md](./07-BACKEND.md) |
| 12 | CI/CD Pipeline | [09-DEVOPS.md](./09-DEVOPS.md) |
| 13 | Security Architecture | [08-SECURITY.md](./08-SECURITY.md) |
| 14 | Scalability Strategy | This document §1 |
| 15 | MVP Roadmap | [10-MVP-ROADMAP.md](./10-MVP-ROADMAP.md) |
| 16 | Technical Summary | This document |

---

## 5. Interview-Ready Talking Points

1. **Why MongoDB?** Flexible schema for evolving internship fields; horizontal sharding; document model fits nested applications/status history.
2. **Why modular monolith first?** Faster MVP, single deploy; clear module boundaries enable later extraction.
3. **How prevent duplicate applications?** Unique compound index `{ studentId, internshipId }`.
4. **Refresh token rotation?** Detect reuse → revoke family → force re-login (stolen token protection).
5. **Scale reads?** Redis cache + secondary reads + denormalized counts on internships.
6. **99.9% how?** Multi-AZ, health probes, auto-restart, no single point of failure in app tier.

---

## 6. Next Implementation Steps

1. Initialize monorepo: `frontend/`, `backend/`, `k8s/`
2. Implement auth module end-to-end with tests
3. Seed MongoDB with sample companies/internships
4. Deploy staging on EKS via GitHub Actions
5. Run OWASP ZAP baseline before production

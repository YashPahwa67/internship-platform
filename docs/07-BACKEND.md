# Backend Architecture (Node.js + Express)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20 LTS |
| Framework | Express 4.x |
| ODM | Mongoose 8 |
| Validation | Joi / Zod |
| Auth | jsonwebtoken, bcrypt, speakeasy (MFA) |
| Queue | Bull + Redis |
| Logging | Winston + Morgan |
| Docs | Swagger/OpenAPI 3.1 |
| Testing | Jest + Supertest |

---

## Enterprise Folder Structure

```
backend/
├── src/
│   ├── app.js                       # Express app factory
│   ├── server.js                    # HTTP server bootstrap
│   ├── config/
│   │   ├── index.js                 # env validation (joi)
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── aws.js
│   ├── routes/
│   │   ├── index.js                 # mount all v1 routes
│   │   ├── auth.routes.js
│   │   ├── internship.routes.js
│   │   ├── application.routes.js
│   │   ├── task.routes.js
│   │   ├── evaluation.routes.js
│   │   ├── attendance.routes.js
│   │   ├── certificate.routes.js
│   │   ├── notification.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── internship.controller.js
│   │   └── ...
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── token.service.js
│   │   ├── internship.service.js
│   │   ├── application.service.js
│   │   ├── task.service.js
│   │   ├── notification.service.js
│   │   ├── certificate.service.js
│   │   ├── s3.service.js
│   │   └── analytics.service.js
│   ├── repositories/
│   │   ├── base.repository.js
│   │   ├── user.repository.js
│   │   ├── internship.repository.js
│   │   └── ...
│   ├── models/
│   │   ├── user.model.js
│   │   ├── company.model.js
│   │   ├── internship.model.js
│   │   └── ...
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js             # RBAC permission check
│   │   ├── validate.js
│   │   ├── rateLimiter.js
│   │   ├── errorHandler.js
│   │   ├── requestId.js
│   │   └── csrf.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── ...
│   ├── events/
│   │   ├── eventBus.js
│   │   ├── publishers/
│   │   └── subscribers/
│   ├── jobs/
│   │   ├── email.job.js
│   │   ├── certificate.job.js
│   │   └── analytics.job.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── logger.js
│   │   └── pagination.js
│   ├── constants/
│   │   ├── roles.js
│   │   ├── permissions.js
│   │   └── applicationStatus.js
│   └── types/                       # if TypeScript migration
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── Dockerfile
├── docker-compose.yml               # local dev
├── .env.example
├── package.json
└── jest.config.js
```

---

## Layer Responsibilities

```
Request → Middleware → Controller → Service → Repository → MongoDB
                              ↓
                         Event Bus → Workers
```

| Layer | Responsibility |
|-------|----------------|
| **Controller** | HTTP in/out, status codes, call service |
| **Service** | Business rules, transactions, emit events |
| **Repository** | DB queries only, no business logic |
| **Model** | Schema, hooks, instance methods |

---

## Example: Application Status Update

```javascript
// application.service.js
async updateStatus(applicationId, newStatus, actor) {
  const application = await applicationRepo.findById(applicationId);
  if (!canTransition(application.status, newStatus)) {
    throw new ApiError(400, 'INVALID_STATUS_TRANSITION');
  }
  const updated = await applicationRepo.updateStatus(applicationId, newStatus, {
    history: { status: newStatus, by: actor.id, at: new Date() }
  });
  eventBus.publish('application.status_changed', { applicationId, newStatus });
  return updated;
}
```

---

## Error Handling

- `ApiError` extends Error with `statusCode` + `code`
- Central `errorHandler` middleware — no stack in production
- Unhandled rejections logged + process manager restart (PM2/K8s)

---

## Logging

```json
{
  "level": "info",
  "requestId": "uuid",
  "userId": "...",
  "method": "POST",
  "path": "/api/v1/applications",
  "durationMs": 45
}
```

Correlation ID propagated via `X-Request-Id`.

---

## SOLID Mapping

| Principle | Implementation |
|-----------|----------------|
| SRP | One service per domain module |
| OCP | Strategy pattern for notification channels |
| LSP | Repository interfaces swappable for tests |
| ISP | Granular permission constants |
| DIP | Services depend on repository interfaces injected |

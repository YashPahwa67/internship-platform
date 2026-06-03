# System Design: Use Cases, Workflows, HLD, LLD

---

## 1. Use Case Diagram

```mermaid
graph TB
    subgraph Actors
        ST[Student]
        HR[Company HR]
        MN[Mentor]
        AD[Admin]
        SYS[External Systems]
    end

    subgraph Authentication
        UC1[Register / Login]
        UC2[OAuth / MFA]
        UC3[Password Reset]
    end

    subgraph Student_UseCases
        UC10[Manage Profile]
        UC11[Search Internships]
        UC12[Apply / Withdraw]
        UC13[Submit Tasks]
        UC14[View Evaluations]
    end

    subgraph Company_UseCases
        UC20[Manage Company Profile]
        UC21[Post Internship]
        UC22[Manage Applicants]
        UC23[Schedule Interview]
        UC24[Assign Mentor]
        UC25[Generate Certificate]
    end

    subgraph Mentor_UseCases
        UC30[View Interns]
        UC31[Assign Tasks]
        UC32[Review Submissions]
        UC33[Track Attendance]
    end

    subgraph Admin_UseCases
        UC40[Approve Company]
        UC41[Moderate Internship]
        UC42[User Management]
        UC43[Analytics]
        UC44[Platform Settings]
    end

    ST --> UC1 & UC10 & UC11 & UC12 & UC13 & UC14
    HR --> UC1 & UC20 & UC21 & UC22 & UC23 & UC24 & UC25
    MN --> UC1 & UC30 & UC31 & UC32 & UC33
    AD --> UC1 & UC40 & UC41 & UC42 & UC43 & UC44
    SYS --> UC2
```

---

## 2. Core Workflow Diagrams

### 2.1 Internship Approval Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: HR creates
    Draft --> PendingReview: HR submits
    PendingReview --> Published: Admin approves
    PendingReview --> Rejected: Admin rejects
    Published --> Closed: HR closes / expiry
    Published --> Archived: Admin archives
    Rejected --> Draft: HR edits & resubmits
    Closed --> [*]
    Archived --> [*]
```

### 2.2 Application Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Applied: Student applies
    Applied --> Withdrawn: Student withdraws
    Applied --> Shortlisted: HR shortlists
    Applied --> Rejected: HR rejects
    Shortlisted --> InterviewScheduled
    InterviewScheduled --> Offered
    Offered --> Accepted: Student accepts
    Offered --> Declined: Student declines
    Accepted --> ActiveInternship
    ActiveInternship --> Completed
    Completed --> [*]
```

### 2.3 Task Submission Flow

```mermaid
sequenceDiagram
    participant M as Mentor
    participant API as API Gateway
    participant SVC as Task Service
    participant DB as MongoDB
    participant S3 as S3
    participant N as Notification Svc
    participant ST as Student

    M->>API: POST /tasks
    API->>SVC: createTask()
    SVC->>DB: insert Task
    SVC->>N: publish task.assigned
    N->>ST: Email + In-app

    ST->>API: GET /tasks/:id/upload-url
    API->>SVC: getPresignedUrl()
    SVC->>S3: presign PUT
    S3-->>ST: upload file

    ST->>API: POST /tasks/:id/submit
    API->>SVC: submitTask()
    SVC->>DB: update submission
    SVC->>N: publish task.submitted
    N->>M: Notify mentor

    M->>API: POST /tasks/:id/review
    API->>SVC: reviewTask()
    SVC->>DB: status + feedback
    SVC->>N: publish task.reviewed
    N->>ST: Feedback notification
```

### 2.4 Authentication Token Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API
    participant Auth as Auth Service
    participant R as Redis
    participant DB as MongoDB

    C->>API: POST /auth/login
    API->>Auth: validate credentials
    Auth->>DB: find user + bcrypt compare
    Auth->>R: store refresh jti (family)
    Auth-->>C: access JWT (15m) + refresh cookie

    C->>API: GET /protected (access expired)
    API-->>C: 401 TOKEN_EXPIRED

    C->>API: POST /auth/refresh
    API->>Auth: validate refresh + rotate
    Auth->>R: invalidate old jti, store new
    Auth-->>C: new access + refresh cookie

    C->>API: POST /auth/logout
    Auth->>R: blacklist access jti + delete refresh family
```

---

## 3. High-Level Architecture

```mermaid
flowchart TB
    subgraph Client
        WEB[React SPA<br/>CloudFront CDN]
    end

    subgraph Edge
        R53[Route 53]
        CF[CloudFront]
        WAF[AWS WAF]
        NGINX[NGINX Ingress<br/>K8s]
    end

    subgraph Gateway
        GW[API Gateway / ALB<br/>Rate Limit · TLS · Routing]
    end

    subgraph App_Tier
        API1[Express API Pod x N]
        API2[Express API Pod x N]
        WORK[Worker Pods<br/>Bull Queue]
    end

    subgraph Data_Tier
        MONGO[(MongoDB Atlas<br/>Sharded Cluster)]
        REDIS[(Redis Cloud<br/>Cache · Sessions · Queues)]
        S3[(S3 Buckets<br/>Resumes · Submissions)]
    end

    subgraph Services
        NOTIF[Notification Service<br/>SES · SNS · FCM]
        PDF[Certificate PDF Generator]
    end

    subgraph Observability
        CW[CloudWatch]
        DD[Datadog / X-Ray]
        LOG[Centralized Logs]
    end

    WEB --> CF --> WAF --> NGINX --> GW
    GW --> API1 & API2
    API1 & API2 --> MONGO & REDIS & S3
    API1 & API2 --> NOTIF
    WORK --> MONGO & REDIS & NOTIF & PDF
    API1 & API2 --> CW & DD
```

### 3.1 Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| React SPA | UI, RTK Query, client validation, protected routes |
| CloudFront | Static assets, edge caching, HTTPS |
| NGINX Ingress | TLS termination, path routing, request size limits |
| API Gateway/ALB | Load balance, health checks, connection draining |
| Express API | REST, auth, business logic orchestration |
| Worker | Async: emails, PDF certs, analytics aggregation |
| MongoDB | Primary persistence, transactions where needed |
| Redis | Session blocklist, rate limits, cache, job queue |
| S3 | File storage with lifecycle policies |
| Notification Svc | Template rendering, channel dispatch |

---

## 4. Low-Level Design by Module

### 4.1 User Management

| Layer | Components |
|-------|------------|
| **Frontend** | `RegisterPage`, `LoginPage`, `ProfilePage`, `SkillsEditor`, `ResumeUpload` |
| **API** | `POST /auth/*`, `GET/PUT /users/me`, `GET /students/:id` |
| **Services** | `AuthService`, `UserService`, `StudentProfileService`, `FileUploadService` |
| **Repositories** | `UserRepository`, `StudentRepository` |
| **Collections** | `users`, `students` |
| **Events** | `user.registered`, `user.verified`, `profile.updated` |

### 4.2 Internship Management

| Layer | Components |
|-------|------------|
| **Frontend** | `InternshipList`, `InternshipDetail`, `PostInternshipForm`, `AdminModerationQueue` |
| **API** | `CRUD /internships`, `POST /internships/:id/submit`, `POST /admin/internships/:id/approve` |
| **Services** | `InternshipService`, `SearchService`, `RecommendationService` (P3) |
| **Collections** | `internships`, `companies` |
| **Cache** | Published listings by filter hash (TTL 5m) |
| **Events** | `internship.submitted`, `internship.published` |

### 4.3 Application Management

| Layer | Components |
|-------|------------|
| **Frontend** | `ApplicationTracker`, `ApplicantKanban`, `InterviewScheduler` |
| **API** | `POST /applications`, `PATCH /applications/:id/status` |
| **Services** | `ApplicationService`, `InterviewService` |
| **Collections** | `applications` |
| **Events** | `application.status_changed` |

### 4.4 Task Management

| Layer | Components |
|-------|------------|
| **Frontend** | `TaskBoard`, `TaskDetail`, `SubmissionForm`, `ReviewPanel` |
| **API** | `POST /tasks`, `POST /tasks/:id/submit`, `POST /tasks/:id/review` |
| **Services** | `TaskService`, `SubmissionService` |
| **Collections** | `tasks` |
| **Events** | `task.assigned`, `task.submitted`, `task.reviewed` |

### 4.5 Attendance

| Layer | Components |
|-------|------------|
| **Frontend** | `CheckInWidget`, `AttendanceCalendar` |
| **API** | `POST /attendance/check-in`, `POST /attendance/check-out` |
| **Services** | `AttendanceService` |
| **Collections** | `attendance` (compound index: internId + date) |

### 4.6 Evaluations & Certificates

| Layer | Components |
|-------|------------|
| **Services** | `EvaluationService`, `CertificateService`, `PdfGenerator` |
| **Collections** | `evaluations`, `certificates` |
| **Events** | `certificate.issued`, `certificate.revoked` |

### 4.7 Notifications

| Layer | Components |
|-------|------------|
| **Services** | `NotificationService`, `TemplateEngine`, channel adapters |
| **Collections** | `notifications`, `notification_preferences` |
| **Queue** | Bull: `email`, `sms`, `push` queues |

### 4.8 Analytics

| Layer | Components |
|-------|------------|
| **Services** | `AnalyticsService` (reads aggregated collections + Redis) |
| **Collections** | `analytics_daily` (materialized), `audit_logs` |
| **Pipeline** | Nightly cron worker aggregates raw events |

---

## 5. Event-Driven Architecture (Microservice-Ready)

```mermaid
flowchart LR
    API[Express API] -->|publish| BUS[Event Bus<br/>Redis Streams / SNS]
    BUS --> W1[Email Worker]
    BUS --> W2[Analytics Worker]
    BUS --> W3[Certificate Worker]
    BUS --> W4[Search Index Worker]
```

**Event envelope:**
```json
{
  "eventId": "uuid",
  "type": "application.status_changed",
  "version": 1,
  "timestamp": "ISO-8601",
  "actorId": "userId",
  "payload": { "applicationId": "...", "from": "applied", "to": "shortlisted" }
}
```

Future extraction: Auth, Notifications, Analytics → independent services sharing event contracts.

---

## 6. API Gateway Routing

| Path Prefix | Service | Notes |
|-------------|---------|-------|
| `/api/v1/auth/*` | Auth module | Public + rate limited |
| `/api/v1/internships/*` | Internship | Cache GET |
| `/api/v1/applications/*` | Application | RBAC strict |
| `/api/v1/tasks/*` | Task | File presign |
| `/api/v1/admin/*` | Admin | `admin` role only |
| `/api/v1/health` | Health | K8s probes |

---

## 7. Deployment Topology (K8s)

```mermaid
flowchart TB
    subgraph EKS_Cluster
        ING[Ingress NGINX]
        subgraph NS_api
            DEP_API[Deployment: api<br/>HPA 2-20 pods]
            DEP_WORK[Deployment: worker<br/>HPA 1-10]
        end
        subgraph NS_data
            SEC[External Secrets Operator]
        end
    end
    ING --> DEP_API
    DEP_API --> Atlas[(MongoDB Atlas)]
    DEP_API --> RedisCloud[(Redis)]
    DEP_WORK --> Atlas
```

**HPA triggers:** CPU > 70%, custom metric request rate > 1000 RPS/pod.

# Wireframes (Low-Fidelity)

ASCII wireframes for all required screens. Production UI uses MUI components with 12-column responsive grid.

---

## Public Pages

### Landing Page `/`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo IMP]     Internships  Companies  About  Contact    [Login] [Register] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     Find Your Next Internship                                               │
│     Connect with top companies. Track applications. Grow your career.       │
│                                                                             │
│     [ Search internships...          ] [Location ▼] [ Search ]              │
│                                                                             │
│     ┌─────────┐  ┌─────────┐  ┌─────────┐                                   │
│     │ 50K+    │  │ 500+    │  │ 95%     │   Featured Internships →          │
│     │Students │  │Companies│  │Placement│   ┌──────┐ ┌──────┐ ┌──────┐      │
│     └─────────┘  └─────────┘  └─────────┘   │ Card │ │ Card │ │ Card │      │
│                                             └──────┘ └──────┘ └──────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│ How it works:  1.Register  2.Apply  3.Intern  4.Certify                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Footer: About | Privacy | Terms | Contact                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### About Us `/about`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header (same as landing)                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Our Mission                                                                │
│  [Hero image]    IMP bridges students and industry...                       │
│                                                                             │
│  Team                    Values                                               │
│  ┌────┐ ┌────┐ ┌────┐    • Transparency  • Security  • Growth               │
│  │    │ │    │ │    │                                                       │
│  └────┘ └────┘ └────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Contact Us `/contact`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Contact Us                                                                  │
│  Name:     [________________]                                               │
│  Email:    [________________]                                               │
│  Subject:  [________________]                                               │
│  Message:  [________________]                                               │
│            [________________]                                               │
│            [ Send Message ]                                                 │
│  Office: 123 Tech Park, Bangalore                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Student Pages

### Dashboard `/student/dashboard`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Welcome, Jane                                    [🔔 3] [Profile] │
│          ├──────────────────────────────────────────────────────────────────┤
│ Dashboard│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│ Internsh.│ │ Applications│ │ In Progress │ │ Tasks Due   │ │ Completed   │  │
│ Applicat.│ │     12      │ │      2      │ │      3      │ │      1      │  │
│ Tasks    │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│ Profile  │                                                                  │
│          │ Recommended for You                                             │
│          │ ┌────────────────────────────────────────────────────────────┐  │
│          │ │ Frontend Dev Intern @ Acme Corp    [Remote] [Apply]        │  │
│          │ │ Data Analyst Intern @ Beta Ltd     [Hybrid] [Apply]        │  │
│          │ └────────────────────────────────────────────────────────────┘  │
│          │ Recent Activity                                                  │
│          │ • Application shortlisted - Acme Corp                            │
│          │ • Task "Week 2 Report" due tomorrow                              │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Internship Listing `/student/internships`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Internships                                                      │
│          │ [Search...] [Skills ▼] [Type ▼] [Location] [Stipend ▼] [Sort ▼]  │
│          ├──────────────────────────────────────────────────────────────────┤
│          │ ┌──────────────────────────────────────────────────────────────┐ │
│          │ │ [Logo] Frontend Developer Intern                             │ │
│          │ │ Acme Corp · Remote · ₹15-25k/mo · 3 months · 5 openings      │ │
│          │ │ React, Node.js                                    [View →]   │ │
│          │ └──────────────────────────────────────────────────────────────┘ │
│          │ ┌──────────────────────────────────────────────────────────────┐ │
│          │ │ [Logo] Data Science Intern                                   │ │
│          │ └──────────────────────────────────────────────────────────────┘ │
│          │                    [ < 1 2 3 ... 10 > ]                          │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Internship Details `/student/internships/:id`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ ← Back                                                           │
│          │ Frontend Developer Intern                                        │
│          │ Acme Corp · Posted 2 days ago · Deadline: Jun 30                 │
│          ├───────────────────────────────┬──────────────────────────────────┤
│          │ Description                   │ ┌────────────────────────────┐   │
│          │ Lorem ipsum role details...   │ │ [Apply Now]                │   │
│          │                               │ │ Stipend: ₹20k/mo           │   │
│          │ Requirements                  │ │ Duration: 12 weeks         │   │
│          │ • React  • Node  • Git          │ │ Openings: 3                │   │
│          │                               │ └────────────────────────────┘   │
│          │ About Company                 │ Cover letter (optional):         │
│          │ [Company blurb]               │ [________________________]       │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Task Board `/student/tasks`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ My Tasks                    [Kanban ▼] [List]                    │
│          │ ┌─────────────┬─────────────┬─────────────┬─────────────┐        │
│          │ │  To Do (2)  │ In Progress │ Submitted(1)│  Done (5)   │        │
│          │ ├─────────────┼─────────────┼─────────────┼─────────────┤        │
│          │ │ Week 3      │ API Design  │ Week 2      │ Week 1      │        │
│          │ │ Report      │ doc         │ Report ✓    │ Onboarding  │        │
│          │ │ Due: Jun 5  │ Due: Jun 8  │             │             │        │
│          │ └─────────────┴─────────────┴─────────────┴─────────────┘        │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Profile `/student/profile`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Profile                                    [Edit] [Save]           │
│          │ [Avatar]  Jane Doe · jane@edu.com                                │
│          │ University: MIT · Graduation: 2027                               │
│          │ Bio: [________________________________]                          │
│          │ Skills: [React ×] [Node ×] [+ Add]                               │
│          │ Resume: resume.pdf (uploaded Jun 1) [Replace]                    │
│          │ Portfolio: github.com/jane [+ Add link]                          │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

---

## Company Pages

### Dashboard `/company/dashboard`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Acme Corp Dashboard                              [Post Internship]│
│          │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│          │ │ Active   │ │ Total    │ │ Pending  │ │ Active   │              │
│          │ │ Listings │ │ Applic.  │ │ Review   │ │ Interns  │              │
│          │ │    5     │ │   142    │ │    2     │ │    8     │              │
│          │ └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│          │ Applicant Pipeline (this week)                                     │
│          │ [Chart: Applied → Shortlisted → Interview → Offer]               │
│          │ Recent Applications                                                │
│          │ Jane Doe · Frontend Intern · Applied · [Review]                  │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Post Internship `/company/internships/new`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Post New Internship                          [Save Draft] [Submit]│
│          │ Title:        [________________________]                         │
│          │ Description:  [Rich text editor________________]                 │
│          │ Skills:       [React] [Node] [+ Add]                               │
│          │ Type:         ( ) Remote ( ) Hybrid ( ) Onsite                     │
│          │ Location:     [________________]                                   │
│          │ Stipend:      Min [____] Max [____] Currency [INR ▼]             │
│          │ Duration:     [12] weeks    Openings: [3]                        │
│          │ Deadline:     [📅 Date picker]                                   │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Candidate Management `/company/candidates`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Candidates          Internship: [Frontend Dev ▼]  [Export CSV]   │
│          │ [All] [Applied] [Shortlisted] [Interview] [Offer] [Rejected]     │
│          │ ┌────────────────────────────────────────────────────────────┐ │
│          │ │ □ Jane Doe      MIT    Applied    Jun 1   [Shortlist][Reject]│ │
│          │ │ □ John Smith    IIT    Shortlisted Jun 2  [Schedule][Reject]│ │
│          │ │ □ Priya Patel   NIT    Interview  Jun 3  [Offer]    [Reject]│ │
│          │ └────────────────────────────────────────────────────────────┘ │
│          │ Bulk: [Shortlist Selected] [Reject Selected]                     │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Reports `/company/reports`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Reports                    Date range: [Last 30 days ▼]          │
│          │ [Placement Rate Chart]    [Application Funnel]                   │
│          │ [Intern Performance Table]                                       │
│          │ [Download PDF Report]                                            │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

---

## Mentor Pages

### Dashboard `/mentor/dashboard`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Mentor Dashboard                                                 │
│          │ Assigned Interns: 4    Tasks Pending Review: 2                   │
│          │ ┌────────────────────────────────────────────────────────────┐   │
│          │ │ Jane Doe · Frontend @ Acme · 2 tasks due · [View →]        │   │
│          │ │ John Smith · Backend @ Acme · On track · [View →]            │   │
│          │ └────────────────────────────────────────────────────────────┘   │
│          │ Pending Reviews                                                  │
│          │ • Week 2 Report - Jane Doe - submitted 2h ago [Review]           │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Assigned Interns `/mentor/interns`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ My Interns                                                       │
│          │ ┌──────────────┬──────────┬──────────┬──────────┬────────────┐ │
│          │ │ Name         │ Progress │ Tasks    │ Attend.  │ Actions    │ │
│          │ ├──────────────┼──────────┼──────────┼──────────┼────────────┤ │
│          │ │ Jane Doe     │ ████░ 80%│ 8/10     │ 95%      │ [Tasks][Eval]│
│          │ └──────────────┴──────────┴──────────┴──────────┴────────────┘ │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Task Reviews `/mentor/tasks/reviews`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Review: Week 2 Report - Jane Doe                                 │
│          │ Submitted: Jun 2, 2026 · Files: report.pdf [Download]            │
│          │ Student notes: Completed analysis of user metrics...             │
│          │ Rating: [★★★★☆]                                                  │
│          │ Feedback: [________________________________]                     │
│          │ [Approve] [Request Revision] [Reject]                            │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

---

## Admin Pages

### Analytics Dashboard `/admin/analytics`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Platform Analytics                    [Export] [Date Range ▼]    │
│          │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                    │
│          │ │ Users  │ │ Active │ │ Apps   │ │ Revenue│                    │
│          │ │ 12,450 │ │ Intern.│ │ 3,200  │ │ ₹2.1M  │                    │
│          │ │        │ │  890   │ │ /month │ │ /month │                    │
│          │ └────────┘ └────────┘ └────────┘ └────────┘                    │
│          │ [Line: Registrations over time]  [Bar: Top companies]           │
│          │ [Funnel: Apply → Offer → Accept] [Map: Users by region]          │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### User Management `/admin/users`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Users        [Search...] Role:[All▼] Status:[All▼]  [+ Invite]   │
│          │ ┌────────┬──────────────┬──────────┬────────┬─────────────────┐ │
│          │ │ Name   │ Email        │ Role     │ Status │ Actions         │ │
│          │ ├────────┼──────────────┼──────────┼────────┼─────────────────┤ │
│          │ │ Jane   │ j@edu.com    │ student  │ active │ [View][Suspend] │ │
│          │ │ HR Bob │ b@acme.com   │ company  │ active │ [View][Suspend] │ │
│          │ └────────┴──────────────┴──────────┴────────┴─────────────────┘ │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

### Internship Moderation `/admin/internships/moderation`

```
┌──────────┬──────────────────────────────────────────────────────────────────┐
│ SIDEBAR  │ Pending Internship Reviews (12)                                  │
│          │ ┌────────────────────────────────────────────────────────────┐ │
│          │ │ Frontend Dev · Acme Corp · Submitted Jun 1                   │ │
│          │ │ [Preview]                              [Approve] [Reject]    │ │
│          │ └────────────────────────────────────────────────────────────┘ │
│          │ Rejection reason: [________________] (required on reject)        │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

---

## Responsive Notes

- **Mobile:** Sidebar collapses to bottom nav (4 icons); tables become cards
- **Tablet:** 2-column dashboard stats
- **Desktop:** Full sidebar + 12-col grid

## Design Tokens (Reference)

- Primary: `#2563EB` | Success: `#16A34A` | Warning: `#CA8A04` | Error: `#DC2626`
- Spacing: 4px base unit | Border radius: 8px cards
- Typography: Inter, 14px body, 24px H1

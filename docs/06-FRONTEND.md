# Frontend Architecture (React)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18+ |
| State | Redux Toolkit + RTK Query |
| Routing | React Router v6 |
| UI | MUI v5 + Tailwind (utility layout) |
| Forms | React Hook Form + Zod |
| Build | Vite |
| Testing | Vitest + React Testing Library + Playwright E2E |

---

## Enterprise Folder Structure

```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── store.ts                 # configureStore
│   │   ├── rootReducer.ts
│   │   └── hooks.ts                 # useAppDispatch, useAppSelector
│   ├── api/
│   │   ├── baseApi.ts               # RTK Query createApi + fetchBaseQuery
│   │   ├── authApi.ts
│   │   ├── internshipApi.ts
│   │   ├── applicationApi.ts
│   │   ├── taskApi.ts
│   │   └── tags.ts                  # providesTags / invalidatesTags
│   ├── assets/
│   ├── components/
│   │   ├── common/                  # Button, Modal, DataTable, EmptyState
│   │   ├── layout/                  # AppShell, Sidebar, Header, Footer
│   │   ├── forms/                   # FormField, FileUpload, SkillTagsInput
│   │   └── feedback/                # Toast, Skeleton, ErrorBoundary
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/               # Login, Register, ForgotPassword, MFA
│   │   │   ├── components/
│   │   │   └── authSlice.ts
│   │   ├── student/
│   │   │   ├── pages/               # Dashboard, Internships, Applications, Tasks
│   │   │   └── components/
│   │   ├── company/
│   │   │   ├── pages/               # Dashboard, PostInternship, Candidates
│   │   │   └── components/
│   │   ├── mentor/
│   │   │   └── pages/
│   │   └── admin/
│   │       └── pages/
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleRoute.tsx            # role-based guard
│   │   └── routeConfig.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── axios.ts                 # optional; prefer RTK Query
│   │   ├── constants.ts
│   │   └── validators/              # Zod schemas shared with types
│   ├── theme/
│   │   ├── muiTheme.ts
│   │   ├── darkTheme.ts
│   │   └── ThemeProvider.tsx
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── internship.types.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   └── permissions.ts
│   ├── i18n/                        # future
│   └── main.tsx
├── .env.example
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Key Patterns

### Protected Routes
```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<RoleRoute roles={['student']} />}>
    <Route path="/student/dashboard" element={<StudentDashboard />} />
  </Route>
</Route>
```

### RTK Query Base API
- `credentials: 'include'` for cookie auth
- Automatic refresh on 401 via `baseQueryWithReauth`
- Tag-based cache invalidation

### Dark Mode
- MUI `ThemeProvider` + `prefers-color-scheme` + user toggle in settings
- Persist preference in `localStorage`

### Accessibility (WCAG 2.1 AA)
- Semantic HTML, ARIA labels on icons
- Focus traps in modals
- Keyboard nav for DataTable
- Color contrast ≥ 4.5:1

### Performance
- Route-based code splitting (`React.lazy`)
- Virtualized lists for applications (react-window)
- Image lazy loading via CloudFront URLs

---

## Page Map by Role

| Route | Page | Role |
|-------|------|------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/student/dashboard` | Dashboard | Student |
| `/student/internships` | Listing | Student |
| `/student/internships/:id` | Detail | Student |
| `/student/tasks` | Task Board | Student |
| `/company/dashboard` | Dashboard | HR |
| `/company/internships/new` | Post | HR |
| `/company/candidates` | Pipeline | HR |
| `/mentor/dashboard` | Dashboard | Mentor |
| `/admin/analytics` | Analytics | Admin |

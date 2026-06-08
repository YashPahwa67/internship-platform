import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Internship Management Platform API',
      version: '1.0.0',
      description:
        'REST API for IMP — student internship applications, company HR, mentor matching, admin management.',
      contact: { name: 'IMP Support', email: 'yashpahwa1209@gmail.com' },
    },
    servers: [{ url: '/api/v1', description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['student', 'company_hr', 'mentor', 'admin'] },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            status: { type: 'string', enum: ['active', 'suspended', 'deleted', 'pending_verification'] },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string', enum: ['applied','shortlisted','interview_scheduled','offered','accepted','rejected','withdrawn','active','completed'] },
            coverLetter: { type: 'string' },
            appliedAt: { type: 'string', format: 'date-time' },
            internship: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' } } },
          },
        },
        Internship: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['remote', 'onsite', 'hybrid'] },
            location: { type: 'string' },
            durationWeeks: { type: 'integer' },
            openings: { type: 'integer' },
            stipend: { type: 'object', properties: { min: { type: 'number' }, max: { type: 'number' } } },
            skills: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['draft', 'published', 'closed'] },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication — register, login, OTP, refresh, OAuth' },
      { name: 'Internships', description: 'Browse and manage internship listings' },
      { name: 'Applications', description: 'Apply, track, and manage applications' },
      { name: 'Students', description: 'Student profile management' },
      { name: 'Mentorships', description: 'Mentor-student matching' },
      { name: 'Admin', description: 'Platform administration — requires admin role' },
      { name: 'Notifications', description: 'In-app notifications' },
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'], summary: 'Register new account',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password','role','firstName'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 }, role: { type: 'string', enum: ['student','company_hr'] }, firstName: { type: 'string' }, lastName: { type: 'string' }, companyName: { type: 'string', description: 'Required when role is company_hr' } } } } } },
          responses: { 201: { description: 'OTP sent to email' }, 409: { description: 'Email already registered' } },
          security: [],
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Auth'], summary: 'Verify email OTP — returns access + refresh tokens',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','otp'], properties: { email: { type: 'string' }, otp: { type: 'string', minLength: 6, maxLength: 6 } } } } } },
          responses: { 200: { description: 'Authenticated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, accessToken: { type: 'string' } } } } } } } } },
          security: [],
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login with email + password',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' }, 403: { description: 'Account deleted/suspended' } },
          security: [],
        },
      },
      '/auth/google': { get: { tags: ['Auth'], summary: 'Initiate Google OAuth flow', security: [], responses: { 302: { description: 'Redirect to Google' } } } },
      '/auth/refresh-token': { post: { tags: ['Auth'], summary: 'Refresh access token using httpOnly refresh cookie', security: [], responses: { 200: { description: 'New tokens issued' } } } },
      '/auth/logout': { post: { tags: ['Auth'], summary: 'Invalidate session', responses: { 200: { description: 'Logged out' } } } },
      '/auth/me': { get: { tags: ['Auth'], summary: 'Get current user + profile', responses: { 200: { description: 'User data' } } } },
      '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Send password reset OTP', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } }, responses: { 200: { description: 'OTP sent (if email exists)' } } } },
      '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Reset password using OTP', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, otp: { type: 'string' }, newPassword: { type: 'string' } } } } } }, responses: { 200: { description: 'Password reset' } } } },
      '/internships': {
        get: { tags: ['Internships'], summary: 'List/browse internships', security: [], parameters: [ { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }, { name: 'type', in: 'query', schema: { type: 'string', enum: ['remote','onsite','hybrid'] } }, { name: 'skills', in: 'query', schema: { type: 'string', description: 'Comma-separated' } }, { name: 'stipendMin', in: 'query', schema: { type: 'integer' } }, { name: 'stipendMax', in: 'query', schema: { type: 'integer' } } ], responses: { 200: { description: 'Paginated internship list' } } },
        post: { tags: ['Internships'], summary: 'Create internship (company_hr)', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Internship' } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/internships/{id}': {
        get: { tags: ['Internships'], summary: 'Get internship by ID', security: [], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Internship detail' }, 404: { description: 'Not found' } } },
        patch: { tags: ['Internships'], summary: 'Update internship (company_hr, owner only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Internships'], summary: 'Delete internship (company_hr, owner only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
      },
      '/applications': {
        get: { tags: ['Applications'], summary: 'List applications (filtered by role)', responses: { 200: { description: 'Application list' } } },
        post: { tags: ['Applications'], summary: 'Apply for internship (student) — accepts multipart/form-data with optional resume file', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['internshipId'], properties: { internshipId: { type: 'string' }, coverLetter: { type: 'string' }, resume: { type: 'string', format: 'binary', description: 'Optional resume (PDF/DOC, max 5MB) — overrides profile resume' } } } } } }, responses: { 201: { description: 'Application submitted' } } },
      },
      '/applications/{id}/status': { patch: { tags: ['Applications'], summary: 'Update status (company_hr)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, note: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated' } } } },
      '/applications/{id}/withdraw': { post: { tags: ['Applications'], summary: 'Withdraw application (student)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Withdrawn' } } } },
      '/applications/{id}/student-review': { post: { tags: ['Applications'], summary: 'Submit star rating + comment (student, completed only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['rating'], properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } } } } }, responses: { 200: { description: 'Review recorded' } } } },
      '/applications/{id}/company-review': { post: { tags: ['Applications'], summary: 'Submit star rating for intern (company_hr)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['rating'], properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } } } } }, responses: { 200: { description: 'Review recorded' } } } },
      '/applications/{id}/certificate': { get: { tags: ['Applications'], summary: 'Download PDF certificate (student, completed only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'PDF file', content: { 'application/pdf': {} } } } } },
      '/students/profile': { get: { tags: ['Students'], summary: 'Get own student profile', responses: { 200: { description: 'Profile data' } } }, patch: { tags: ['Students'], summary: 'Update profile fields', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { fullName: { type: 'string' }, phone: { type: 'string' }, college: { type: 'string' }, degree: { type: 'string' }, bio: { type: 'string' }, skills: { type: 'array', items: { type: 'string' } }, location: { type: 'string' }, linkedIn: { type: 'string' }, github: { type: 'string' }, portfolio: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated profile' } } } },
      '/students/profile/picture': { post: { tags: ['Students'], summary: 'Upload profile picture (JPEG/PNG/WebP, max 2MB)', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Updated' } } }, delete: { tags: ['Students'], summary: 'Delete profile picture', responses: { 200: { description: 'Deleted' } } } },
      '/students/profile/resume': { post: { tags: ['Students'], summary: 'Upload resume (PDF/DOC, max 5MB)', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Updated' } } }, delete: { tags: ['Students'], summary: 'Delete resume', responses: { 200: { description: 'Deleted' } } } },
      '/mentorships/mentors': { get: { tags: ['Mentorships'], summary: 'List all active mentors', responses: { 200: { description: 'Mentor list' } } } },
      '/mentorships/request': { post: { tags: ['Mentorships'], summary: 'Request a mentor (student)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['mentorId'], properties: { mentorId: { type: 'string' }, applicationId: { type: 'string' } } } } } }, responses: { 201: { description: 'Request sent' } } } },
      '/mentorships/mine': { get: { tags: ['Mentorships'], summary: 'List own mentorships', responses: { 200: { description: 'Mentorship list' } } } },
      '/mentorships/{id}/respond': { patch: { tags: ['Mentorships'], summary: 'Accept or decline a request (mentor)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['accept'], properties: { accept: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Status updated' } } } },
      '/mentorships/{id}/session-note': { post: { tags: ['Mentorships'], summary: 'Add session note (mentor or student)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string', maxLength: 2000 } } } } } }, responses: { 200: { description: 'Note added' } } } },
      '/mentorships/{id}/progress': { post: { tags: ['Mentorships'], summary: 'Add progress entry (mentor or student)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['entry'], properties: { entry: { type: 'string', maxLength: 2000 } } } } } }, responses: { 200: { description: 'Entry added' } } } },
      '/admin/users': { get: { tags: ['Admin'], summary: 'List users', parameters: [{ name: 'role', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }], responses: { 200: { description: 'User list' } } } },
      '/admin/users/bulk-action': { post: { tags: ['Admin'], summary: 'Bulk suspend / activate / delete users', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['ids','action'], properties: { ids: { type: 'array', items: { type: 'string' } }, action: { type: 'string', enum: ['suspend','activate','delete'] } } } } } }, responses: { 200: { description: 'Results per user' } } } },
      '/admin/users/export': { get: { tags: ['Admin'], summary: 'Export users as CSV', parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'role', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'CSV file', content: { 'text/csv': {} } } } } },
      '/admin/applications/export': { get: { tags: ['Admin'], summary: 'Export applications as CSV', responses: { 200: { description: 'CSV file', content: { 'text/csv': {} } } } } },
      '/admin/users/{id}/status': { patch: { tags: ['Admin'], summary: 'Update single user status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['active','suspended'] } } } } } }, responses: { 200: { description: 'Updated' } } } },
      '/admin/users/{id}': { delete: { tags: ['Admin'], summary: 'Soft-delete user (sets status=deleted)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } } },
      '/admin/users/{id}/restore': { patch: { tags: ['Admin'], summary: 'Restore deleted user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Restored' } } } },
      '/admin/companies/pending': { get: { tags: ['Admin'], summary: 'List pending company approvals', responses: { 200: { description: 'Pending companies' } } } },
      '/admin/companies/{id}/approve': { post: { tags: ['Admin'], summary: 'Approve or reject a company', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { approved: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Updated' } } } },
      '/admin/analytics': { get: { tags: ['Admin'], summary: 'Platform analytics summary', responses: { 200: { description: 'Counts + breakdowns' } } } },
      '/admin/audit-log': { get: { tags: ['Admin'], summary: 'Browse admin audit log', parameters: [{ name: 'action', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }], responses: { 200: { description: 'Paginated log entries' } } } },
      '/notifications': { get: { tags: ['Notifications'], summary: 'List notifications for current user', responses: { 200: { description: 'Notification list with unread count' } } } },
      '/notifications/read-all': { post: { tags: ['Notifications'], summary: 'Mark all as read', responses: { 200: { description: 'Marked' } } } },
      '/notifications/sse': { get: { tags: ['Notifications'], summary: 'Server-Sent Events stream (use ?_t=accessToken)', responses: { 200: { description: 'SSE stream', content: { 'text/event-stream': {} } } } } },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

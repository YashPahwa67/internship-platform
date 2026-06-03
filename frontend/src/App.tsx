import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';

import LandingPage from './features/public/LandingPage';
import AboutPage from './features/public/AboutPage';
import ContactPage from './features/public/ContactPage';
import InternshipBrowsePage from './features/public/InternshipBrowsePage';
import InternshipDetailPage from './features/public/InternshipDetailPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

import StudentDashboard from './features/student/StudentDashboard';
import StudentInternshipsPage from './features/student/StudentInternshipsPage';
import StudentApplicationsPage from './features/student/StudentApplicationsPage';
import StudentTasksPage from './features/student/StudentTasksPage';
import StudentProfilePage from './features/student/StudentProfilePage';

import CompanyDashboard from './features/company/CompanyDashboard';
import PostInternshipPage from './features/company/PostInternshipPage';
import CompanyInternshipsPage from './features/company/CompanyInternshipsPage';
import CandidatesPage from './features/company/CandidatesPage';

import AdminDashboard from './features/admin/AdminDashboard';
import AdminUsersPage from './features/admin/AdminUsersPage';
import AdminModerationPage from './features/admin/AdminModerationPage';
import AdminCompaniesPage from './features/admin/AdminCompaniesPage';

import MentorDashboard from './features/mentor/MentorDashboard';
import NotificationsPage from './features/shared/NotificationsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/internships" element={<InternshipBrowsePage />} />
        <Route path="/internships/:id" element={<InternshipDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/notifications" element={<DashboardLayout />}>
          <Route index element={<NotificationsPage />} />
        </Route>

        <Route element={<RoleRoute roles={['student']} />}>
          <Route path="/student" element={<DashboardLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="internships" element={<StudentInternshipsPage />} />
            <Route path="internships/:id" element={<InternshipDetailPage />} />
            <Route path="applications" element={<StudentApplicationsPage />} />
            <Route path="tasks" element={<StudentTasksPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={['company_hr']} />}>
          <Route path="/company" element={<DashboardLayout />}>
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="internships/new" element={<PostInternshipPage />} />
            <Route path="internships/:id/edit" element={<PostInternshipPage />} />
            <Route path="internships" element={<CompanyInternshipsPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="moderation" element={<AdminModerationPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={['mentor']} />}>
          <Route path="/mentor" element={<DashboardLayout />}>
            <Route path="dashboard" element={<MentorDashboard />} />
            <Route path="tasks" element={<StudentTasksPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

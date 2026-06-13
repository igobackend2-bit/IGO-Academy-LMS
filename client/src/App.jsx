import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentLayout from '@/components/layout/StudentLayout';

// Auth
import LoginPage          from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyOtpPage      from '@/pages/auth/VerifyOtpPage';
import CourseExpiredPage  from '@/pages/auth/CourseExpiredPage';

// Student
import StudentDashboard  from '@/pages/student/Dashboard';
import StudentCourseView from '@/pages/student/CourseView';
import ModulePlayer      from '@/pages/student/ModulePlayer';
import StudentAssessments from '@/pages/student/Assessments';
import QuizView          from '@/pages/student/QuizView';
import StudentCerts      from '@/pages/student/Certificates';

// Trainer
import TrainerDashboard  from '@/pages/trainer/Dashboard';
import TrainerCourseView from '@/pages/trainer/CourseView';
import TrainerGrading    from '@/pages/trainer/Grading';

// Admin
import AdminDashboard    from '@/pages/admin/Dashboard';
import AdminUsers        from '@/pages/admin/Users';
import AdminCourses      from '@/pages/admin/Courses';
import AdminCourseEdit   from '@/pages/admin/CourseEdit';
import AdminEnrollments  from '@/pages/admin/Enrollments';
import AdminAssessments  from '@/pages/admin/Assessments';
import AdminCertificates from '@/pages/admin/Certificates';
import AdminReports      from '@/pages/admin/Reports';

// Public
import VerifyCertificate from '@/pages/public/VerifyCertificate';
import NotFound          from '@/pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public ─────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp"      element={<VerifyOtpPage />} />
        <Route path="/course-expired"  element={<CourseExpiredPage />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

        {/* ── Student ────────────────────────────────── */}
        <Route path="/student" element={<ProtectedRoute role="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="dashboard"                          element={<StudentDashboard />} />
            <Route path="course/:courseId"                   element={<StudentCourseView />} />
            <Route path="course/:courseId/assessments"       element={<StudentAssessments />} />
            <Route path="certificates"                       element={<StudentCerts />} />
          </Route>
          <Route path="course/:courseId/module/:moduleId"    element={<ModulePlayer />} />
          <Route path="quiz/:assessmentId"                   element={<QuizView />} />
        </Route>

        {/* ── Trainer ────────────────────────────────── */}
        <Route path="/trainer" element={<ProtectedRoute role="trainer" />}>
          <Route element={<StudentLayout />}>
            <Route path="dashboard"          element={<TrainerDashboard />} />
            <Route path="course/:courseId"   element={<TrainerCourseView />} />
            <Route path="grading"            element={<TrainerGrading />} />
          </Route>
        </Route>

        {/* ── Admin ──────────────────────────────────── */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard"              element={<AdminDashboard />} />
            <Route path="users"                  element={<AdminUsers />} />
            <Route path="courses"                element={<AdminCourses />} />
            <Route path="courses/:courseId/edit" element={<AdminCourseEdit />} />
            <Route path="enrollments"            element={<AdminEnrollments />} />
            <Route path="assessments"            element={<AdminAssessments />} />
            <Route path="certificates"           element={<AdminCertificates />} />
            <Route path="reports"                element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

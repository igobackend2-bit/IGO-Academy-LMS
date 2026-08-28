import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // updated: homepage route
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SEO from '@/components/common/SEO';
import LoadingScreen from '@/components/common/LoadingScreen';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentLayout from '@/components/layout/StudentLayout';

// Auth
import LoginPage          from '@/pages/auth/LoginPage';
import RegisterPage       from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyOtpPage      from '@/pages/auth/VerifyOtpPage';
import CourseExpiredPage  from '@/pages/auth/CourseExpiredPage';

// Student, Trainer, and Admin are large, logged-in-only dashboards (video
// player, quiz engine, charts, tables) that a first-time public visitor
// never touches. Lazy-loading them keeps those bytes out of the bundle
// everyone downloads just to see the homepage -- doc §12 Core Web Vitals.
// Student
const StudentDashboard   = lazy(() => import('@/pages/student/Dashboard'));
const StudentCourseView  = lazy(() => import('@/pages/student/CourseView'));
const ModulePlayer       = lazy(() => import('@/pages/student/ModulePlayer'));
const StudentAssessments = lazy(() => import('@/pages/student/Assessments'));
const QuizView           = lazy(() => import('@/pages/student/QuizView'));
const StudentCerts       = lazy(() => import('@/pages/student/Certificates'));
const AllAssessments     = lazy(() => import('@/pages/student/AllAssessments'));
const BrowseCourses      = lazy(() => import('@/pages/student/BrowseCourses'));
const StudentInformation = lazy(() => import('@/pages/student/Information'));
const StudentNotes       = lazy(() => import('@/pages/student/Notes'));

// Trainer
const TrainerDashboard  = lazy(() => import('@/pages/trainer/Dashboard'));
const TrainerCourseView = lazy(() => import('@/pages/trainer/CourseView'));
const TrainerGrading    = lazy(() => import('@/pages/trainer/Grading'));

// Admin
const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers        = lazy(() => import('@/pages/admin/Users'));
const AdminCourses      = lazy(() => import('@/pages/admin/Courses'));
const AdminCourseEdit   = lazy(() => import('@/pages/admin/CourseEdit'));
const AdminEnrollments  = lazy(() => import('@/pages/admin/Enrollments'));
const AdminAssessments  = lazy(() => import('@/pages/admin/Assessments'));
const AdminCertificates = lazy(() => import('@/pages/admin/Certificates'));
const AdminReports      = lazy(() => import('@/pages/admin/Reports'));
const AdminResources    = lazy(() => import('@/pages/admin/Resources'));
const AdminBatches      = lazy(() => import('@/pages/admin/Batches'));
const AdminLeads        = lazy(() => import('@/pages/admin/Leads'));

// Public
import VerifyCertificate from '@/pages/public/VerifyCertificate';
import Catalog           from '@/pages/public/Catalog';
import CourseDetail      from '@/pages/public/CourseDetail';
import HomePage          from '@/pages/public/HomePage';
import IgoGroupBrands   from '@/pages/public/IgoGroupBrands';
import AboutPage         from '@/pages/public/AboutPage';
import PrivacyPolicy     from '@/pages/public/PrivacyPolicy';
import TermsAndConditions from '@/pages/public/TermsAndConditions';
import RefundPolicy      from '@/pages/public/RefundPolicy';
import Disclaimer        from '@/pages/public/Disclaimer';
import ContactPage       from '@/pages/public/ContactPage';
import NotFound          from '@/pages/NotFound';

// Public — imported from igobackend3-byte/Igoacademy (parallel-developed
// content: partner ecosystem, success stories, and standalone lead-gen
// landing pages). Lazy-loaded like Student/Trainer/Admin since a first-time
// visitor to the homepage never touches most of these.
const CareersPage        = lazy(() => import('@/pages/public/CareersPage'));
const CollegesPage       = lazy(() => import('@/pages/public/CollegesPage'));
const WorkshopsPage      = lazy(() => import('@/pages/public/WorkshopsPage'));
const EnquirePage        = lazy(() => import('@/pages/public/EnquirePage'));
const StudentSuccessPage = lazy(() => import('@/pages/public/StudentSuccessPage'));
const StudentProfilePage = lazy(() => import('@/pages/public/StudentProfilePage'));
const PartnerProfilePage = lazy(() => import('@/pages/public/PartnerProfilePage'));

export default function App() {
  return (
    <AuthProvider>
      {/* Site-wide default — every page's own <SEO> (rendered further down the
          tree) overrides this exactly once; Helmet resolves nested instances by
          depth, so there's never a duplicate tag like there would be with a
          static default baked into index.html. */}
      <SEO
        title="IGO Academy Learning Platform"
        description="IGO Academy — Together We Grow, Together We Achieve | Agri-Entrepreneurship Training Platform"
        path="/"
      />
      <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ── Public ─────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses"         element={<Catalog />} />
        <Route path="/courses/:id"     element={<CourseDetail />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp"      element={<VerifyOtpPage />} />
        <Route path="/course-expired"  element={<CourseExpiredPage />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
        <Route path="/igo-brands"            element={<IgoGroupBrands />} />
        <Route path="/about"                 element={<AboutPage />} />
        <Route path="/privacy-policy"        element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions"  element={<TermsAndConditions />} />
        <Route path="/refund-policy"         element={<RefundPolicy />} />
        <Route path="/disclaimer"            element={<Disclaimer />} />
        <Route path="/contact"               element={<ContactPage />} />
        <Route path="/careers"               element={<CareersPage />} />
        <Route path="/for-colleges"          element={<CollegesPage />} />
        <Route path="/workshops"             element={<WorkshopsPage />} />
        <Route path="/enquire"               element={<EnquirePage />} />
        <Route path="/student-success"       element={<StudentSuccessPage />} />
        <Route path="/student-success/:slug" element={<StudentProfilePage />} />
        <Route path="/partners/:slug"        element={<PartnerProfilePage />} />

        {/* ── Student ────────────────────────────────── */}
        <Route path="/student" element={<ProtectedRoute role="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="dashboard"                          element={<StudentDashboard />} />
            <Route path="explore"                            element={<BrowseCourses />} />
            <Route path="assessments"                        element={<AllAssessments />} />
            <Route path="course/:courseId"                   element={<StudentCourseView />} />
            <Route path="course/:courseId/assessments"       element={<StudentAssessments />} />
            <Route path="certificates"                       element={<StudentCerts />} />
            <Route path="information"                        element={<StudentInformation />} />
            <Route path="notes"                              element={<StudentNotes />} />
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
            <Route path="resources"              element={<AdminResources />} />
            <Route path="batches"                element={<AdminBatches />} />
            <Route path="leads"                  element={<AdminLeads />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

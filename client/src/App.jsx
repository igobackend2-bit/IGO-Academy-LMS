import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // updated: homepage route
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SEO from '@/components/common/SEO';
import LoadingScreen from '@/components/common/LoadingScreen';
import AdminLayout from '@/components/layout/AdminLayout';
import StudentLayout from '@/components/layout/StudentLayout';

// Auth — lazy for the same reason as Student/Trainer/Admin below: these
// were the one group left eagerly imported (an oversight, not a deliberate
// exception — every other route group already followed doc §12), so every
// visitor's very first bundle carried Register/ForgotPassword/VerifyOtp/
// CourseExpired's code even on a route that only ever needs LoginPage.
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const VerifyOtpPage      = lazy(() => import('@/pages/auth/VerifyOtpPage'));
const CourseExpiredPage  = lazy(() => import('@/pages/auth/CourseExpiredPage'));

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
const AdminLeadAssign   = lazy(() => import('@/pages/admin/LeadAssign'));
const AdminCategories   = lazy(() => import('@/pages/admin/Categories'));

// Executive — a dedicated role (calls leads assigned by admin, updates
// their status). Just one page, lazy for the same reason as everything
// else in this block: no other role's first bundle should carry it.
const ExecutiveMyLeads  = lazy(() => import('@/pages/executive/MyLeads'));

// Public — same oversight as Auth above: these carried real weight (the
// Catalog/CourseDetail pair alone pull in PaymentModal + Razorpay glue)
// into the shared bundle despite the exact rationale already written just
// below for the CareersPage group applying equally here.
const VerifyCertificate = lazy(() => import('@/pages/public/VerifyCertificate'));
const Catalog           = lazy(() => import('@/pages/public/Catalog'));
const CourseDetail      = lazy(() => import('@/pages/public/CourseDetail'));
const HomePage          = lazy(() => import('@/pages/public/HomePage'));
const IgoGroupBrands    = lazy(() => import('@/pages/public/IgoGroupBrands'));
const AboutPage         = lazy(() => import('@/pages/public/AboutPage'));
const PrivacyPolicy     = lazy(() => import('@/pages/public/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('@/pages/public/TermsAndConditions'));
const RefundPolicy      = lazy(() => import('@/pages/public/RefundPolicy'));
const Disclaimer        = lazy(() => import('@/pages/public/Disclaimer'));
const ContactPage       = lazy(() => import('@/pages/public/ContactPage'));
const NotFound          = lazy(() => import('@/pages/NotFound'));

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

        {/* ── Executive ──────────────────────────────── */}
        <Route path="/executive" element={<ProtectedRoute role="executive" />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<ExecutiveMyLeads />} />
          </Route>
        </Route>

        {/* ── Admin ──────────────────────────────────── */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard"              element={<AdminDashboard />} />
            <Route path="users"                  element={<AdminUsers />} />
            <Route path="courses"                element={<AdminCourses />} />
            <Route path="categories"             element={<AdminCategories />} />
            <Route path="courses/:courseId/edit" element={<AdminCourseEdit />} />
            <Route path="enrollments"            element={<AdminEnrollments />} />
            <Route path="assessments"            element={<AdminAssessments />} />
            <Route path="certificates"           element={<AdminCertificates />} />
            <Route path="reports"                element={<AdminReports />} />
            <Route path="resources"              element={<AdminResources />} />
            <Route path="batches"                element={<AdminBatches />} />
            <Route path="leads"                  element={<AdminLeads />} />
            <Route path="lead-assign"            element={<AdminLeadAssign />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

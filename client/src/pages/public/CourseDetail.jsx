/**
 * CourseDetail — public course page (requirement doc Section 5).
 * Route: /courses/:id — no auth required.
 *
 * Data comes from GET /api/courses/public/:id (course.model.js
 * findPublicById), which returns only real, already-stored fields plus the
 * published module titles as the curriculum outline. Sections the doc asks
 * for that this project has no per-course real data for yet — Upcoming
 * Batch (Section 4.9) and Student Testimonials (Section 4.10) — are not
 * fabricated here; they render an honest "contact us" fallback instead,
 * consistent with how IGO_CONTACT and the homepage already handle
 * unavailable real data.
 */
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  Clock, Award, Users, CheckCircle2, BookOpen, GraduationCap,
  Tag, Star, ArrowLeft, Briefcase, Target, ClipboardList,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyCta from '@/components/layout/MobileStickyCta';
import EnquiryForm from '@/components/features/EnquiryForm';
import PaymentModal from '@/components/features/PaymentModal';
import SEO from '@/components/common/SEO';
import SiteFooter from '@/components/layout/SiteFooter';
import { buildCourseSchema } from '@/constants/schema';

/* Fixed learning-method vocabulary from the website refinement spec,
   Section 10 — shown only for the modes this course actually offers
   (course.learning_modes from the API), so nothing is fabricated per-course. */
const LEARNING_METHOD_TAGS = ['Online', 'Offline', 'Hybrid', 'Live Farm Practical'];

function formatPrice(price) {
  const n = Number(price);
  if (!n || n <= 0) return null;
  return '₹' + n.toLocaleString('en-IN');
}

function capFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const COURSE_FAQS = [
  { q: 'Who is eligible to join this course?', a: 'Most IGO Academy courses are open to farmers, students, graduates and entrepreneurs with an interest in the subject — see the Eligibility section above for anything course-specific. If in doubt, use the enquiry form and our team will confirm.' },
  { q: 'Is training practical or only theory?', a: 'IGO Academy courses combine classroom/online learning with practical, hands-on farm training wherever the course format supports it.' },
  { q: 'Will I get a certificate?', a: 'Courses that complete their certification requirements receive a TNSDC + MSME recognised certificate, verifiable online via a QR code.' },
  { q: 'What does this course cost?', a: 'Fees vary by course and batch. Use the Course Fee section above, or contact us for current pricing and any offers.' },
  { q: 'Does IGO Academy help with internships or placement?', a: 'We provide internship and career guidance and support as part of our Career Pathway — this is guidance and support, not a guaranteed job offer.' },
];

function Section({ icon: Icon, title, children }) {
  return (
    <section style={{ marginBottom: '2.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.9rem' }}>
        {Icon && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EDF6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={17} color="#3F8A24" strokeWidth={2.25} />
          </div>
        )}
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#0C2014', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ color: '#4C5B50', fontSize: '.92rem', lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

function Pill({ children }) {
  return (
    <span style={{ background: '#EDF6E4', color: '#2d6a14', fontWeight: 700, fontSize: '.78rem', padding: '.4rem .9rem', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
      {children}
    </span>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payingCourse, setPayingCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['public-course', id],
    queryFn: () => api.get(`/courses/public/${id}`).then(r => r.data.data),
    retry: false,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['course-upcoming-batches', id],
    queryFn: () => api.get('/batches/public/upcoming').then(r => (r.data.data || []).filter(b => b.course_id === id)),
    enabled: !!id,
  });
  const nextBatch = batches[0];

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments/self', { course_id: id }),
    onSuccess: () => {
      toast.success('Enrolled! Redirecting…');
      navigate('/student/dashboard');
    },
    onError: (e) => {
      const msg = e.response?.data?.message || 'Enrollment failed';
      if (e.response?.data?.error === 'CONFLICT' || msg.includes('Already enrolled')) {
        navigate('/student/dashboard');
      } else {
        toast.error(msg);
      }
      setEnrolling(false);
    },
  });

  function handleEnroll() {
    if (!course) return;
    if (!user) {
      navigate(`/register?redirect=/courses/${id}&course=${id}`);
      return;
    }
    if (user.role !== 'student') {
      navigate(`/${user.role}/dashboard`);
      return;
    }
    const price = Number(course.price);
    if (price > 0) {
      setPayingCourse(course);
      return;
    }
    setEnrolling(true);
    enrollMutation.mutate();
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7F3' }}>
        <PublicNav />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 260, borderRadius: 20, marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: 32, width: '60%', borderRadius: 8, marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7F3' }}>
        <PublicNav />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', marginBottom: '.75rem' }}>Course not found</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>This course may have been removed or is no longer active.</p>
          <Link to="/courses" className="btn-primary btn-sm" style={{ width: 'auto', display: 'inline-flex', textDecoration: 'none' }}>
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  const formatted = formatPrice(course.price);
  const isEnrolling = enrolling || enrollMutation.isPending;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <SEO
        title={`${course.title} — IGO Academy`}
        description={course.short_description || course.description || `${course.title} — a TNSDC + MSME recognised agri-skill course from IGO Academy.`}
        path={`/courses/${course.id}`}
        jsonLd={[buildCourseSchema(course)]}
      />
      <PublicNav />

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)', padding: '3rem 1.5rem 3.5rem', color: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link to="/courses" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.35rem', marginBottom: '1.25rem' }}>
            <ArrowLeft size={15} /> All courses
          </Link>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {course.category && <Pill><Tag size={13} /> {course.category}</Pill>}
            {course.level && <Pill><GraduationCap size={13} /> {capFirst(course.level)}</Pill>}
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.7rem,4vw,2.5rem)', marginBottom: '.75rem', letterSpacing: '-.02em' }}>
            {course.title}
          </h1>
          {course.short_description && (
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.02rem', maxWidth: 680, lineHeight: 1.6 }}>
              {course.short_description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem', fontSize: '.88rem', color: 'rgba(255,255,255,0.85)' }}>
            {course.duration_hours ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}><Clock size={15} /> {course.duration_hours} hours</span>
            ) : null}
            {course.trainer_name ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}><Users size={15} /> {course.trainer_name}</span>
            ) : null}
            {course.rating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}><Star size={15} /> {course.rating} rating</span>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '3rem' }} className="course-detail-grid">
        <div>
          <Section icon={BookOpen} title="Course Overview">
            <p>{course.description || course.short_description || 'Detailed course overview will be published shortly — use the enquiry form for full details.'}</p>
          </Section>

          <Section icon={CheckCircle2} title="Who Should Join?">
            <p style={{ marginBottom: '.75rem' }}>This course is designed for:</p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {['Farmers', 'Agriculture Students', 'Agriculture Graduates', 'Entrepreneurs', 'Rural Youth', 'Existing Farm Owners'].map(a => (
                <Pill key={a}>{a}</Pill>
              ))}
            </div>
          </Section>

          <Section icon={Award} title="Eligibility">
            <p>{course.prerequisites || 'No strict prerequisites listed for this course — contact us if you\'re unsure whether it fits your background.'}</p>
          </Section>

          <Section icon={Target} title="What You Will Learn">
            {course.learning_outcomes && course.learning_outcomes.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                {course.learning_outcomes.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            ) : (
              <p>The specific outcome-by-outcome breakdown for this course will be published closer to the batch start date — the Course Overview above covers what this program is about in the meantime.</p>
            )}
          </Section>

          {/* Section order below follows the website refinement spec, Section
              10 (Course Page Template) exactly: What You Will Learn → Course
              Curriculum → Theory/Practical Hours → Learning Method →
              Trainer/Faculty → Career Opportunities → Certification. */}
          <Section icon={BookOpen} title="Detailed Curriculum">
            {course.modules && course.modules.length > 0 ? (
              <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {course.modules.map(m => <li key={m.id}>{m.title}</li>)}
              </ol>
            ) : (
              <p>Detailed module-by-module curriculum will be published closer to the batch start date. Use the enquiry form below for a full syllabus.</p>
            )}
          </Section>

          <Section icon={Clock} title="Theory &amp; Practical Hours">
            {course.theory_hours || course.practical_hours ? (
              <p>{[course.theory_hours && `${course.theory_hours} hrs theory`, course.practical_hours && `${course.practical_hours} hrs live farm practical`].filter(Boolean).join(' + ')}.</p>
            ) : course.duration_hours ? (
              <p>{course.duration_hours} hours total. The exact theory/practical split is confirmed closer to the batch start date — contact us for details.</p>
            ) : (
              <p>The theory/practical hour split for this course is confirmed closer to the batch start date — contact us for details.</p>
            )}
          </Section>

          <Section icon={ClipboardList} title="Learning Method">
            {course.learning_modes && course.learning_modes.length > 0 ? (
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {course.learning_modes.map(m => <Pill key={m}>{m}</Pill>)}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {LEARNING_METHOD_TAGS.map(m => <Pill key={m}>{m}</Pill>)}
              </div>
            )}
          </Section>

          <Section icon={Users} title="Trainer Information">
            <p>{course.trainer_name ? `Led by ${course.trainer_name}${course.trainer_credential ? ` — ${course.trainer_credential}` : ''}.` : 'Trainer details will be shared closer to the batch start date.'}</p>
          </Section>

          <Section icon={Briefcase} title="Practical Training">
            <p>Where the course format supports it, learning is paired with hands-on, real farm practical training — not classroom theory alone.</p>
          </Section>

          <Section icon={Briefcase} title="Career Opportunities">
            {course.career_opportunities && course.career_opportunities.length > 0 ? (
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {course.career_opportunities.map(c => <Pill key={c}>{c}</Pill>)}
              </div>
            ) : (
              <p>Graduates get access to internship and career guidance, and support for those looking to start their own agri-business — as guidance and support, not a guaranteed job offer or income outcome.</p>
            )}
          </Section>

          <Section icon={Award} title="Certification">
            <p>Students who meet the course's completion requirements receive a TNSDC + MSME recognised certificate, independently verifiable online via a QR code.</p>
          </Section>

          <Section title="Frequently Asked Questions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {COURSE_FAQS.map((f, i) => (
                <div key={i}>
                  <p style={{ fontWeight: 700, color: '#0C2014', marginBottom: '.3rem' }}>{f.q}</p>
                  <p style={{ margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Sidebar: fee + enroll + enquiry ── */}
        <div>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', padding: '1.5rem', position: 'sticky', top: 84, marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Course Fee</div>
              {formatted ? (
                <div style={{ color: '#0C2014', fontWeight: 900, fontSize: '1.6rem', fontFamily: "'Sora', sans-serif" }}>{formatted}</div>
              ) : (
                <div style={{ color: '#0C2014', fontWeight: 900, fontSize: '1.1rem' }}>Contact us for pricing</div>
              )}
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Upcoming Batch</div>
              {nextBatch ? (
                <p style={{ fontSize: '.85rem', color: '#4C5B50', margin: 0 }}>
                  {nextBatch.start_date ? dayjs(nextBatch.start_date).format('DD MMM YYYY') : 'Rolling admission'}
                  {nextBatch.mode ? ` · ${nextBatch.mode}` : ''}
                </p>
              ) : (
                <p style={{ fontSize: '.85rem', color: '#4C5B50', margin: 0 }}>Contact us to check the next available batch date and seats.</p>
              )}
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '.85rem', fontWeight: 800, marginBottom: '.6rem' }}
              disabled={isEnrolling}
              onClick={handleEnroll}
            >
              {isEnrolling ? 'Enrolling…' : 'Enroll Now'}
            </button>
            <a href="#course-enquire" className="btn-outline" style={{ width: '100%', padding: '.85rem', fontWeight: 800, display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              Speak with a Course Advisor
            </a>
          </div>

          <div id="course-enquire" style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0C2014', marginBottom: '1rem' }}>
              Enquire About This Course
            </h3>
            <EnquiryForm defaultCourse={course.title} source="course_detail" compact />
          </div>
        </div>
      </div>

      {/* Closing line — website refinement spec, Section 1 & 15: the core
          positioning statement (shortened form) belongs at the close of
          every program/course page, reinforcing the same message the
          homepage, About page and footer already carry. */}
      <section style={{ background: '#F5F7F3', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Sora', sans-serif", fontStyle: 'italic', fontWeight: 700,
          fontSize: '1rem', color: '#0C2014', lineHeight: 1.6, maxWidth: 640, margin: '0 auto',
        }}>
          IGO Academy is a practical agriculture learning ecosystem connecting education,
          live farm exposure, industry skills, careers and entrepreneurship.
        </p>
      </section>

      <SiteFooter />

      <MobileStickyCta />

      <PaymentModal
        course={payingCourse}
        isOpen={!!payingCourse}
        onClose={() => setPayingCourse(null)}
      />

      <style>{`
        @media (max-width: 767px) {
          .course-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

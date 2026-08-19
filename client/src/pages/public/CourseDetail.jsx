/**
 * CourseDetail — public single-course page (doc §5: Course Page Requirements).
 * Route: /courses/:id
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Clock, BarChart3, CheckCircle, Award, Users, MessageCircle } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyBar from '@/components/layout/MobileStickyBar';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import SEO from '@/components/common/SEO';
import PaymentModal from '@/components/features/PaymentModal';
import EnquiryForm from '@/components/features/EnquiryForm';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#0C2014', marginBottom: '1rem' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [paying, setPaying] = useState(false);

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course-detail', id],
    queryFn: () => api.get(`/courses/public/${id}`).then(r => r.data.data),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['course-upcoming-batches', id],
    queryFn: () => api.get('/batches/public/upcoming').then(r => (r.data.data || []).filter(b => b.course_id === id)),
    enabled: !!id,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments/self', { course_id: id }),
    onSuccess: () => { toast.success('Enrolled! Redirecting…'); navigate('/student/dashboard'); },
    onError: (e) => {
      const msg = e.response?.data?.message || 'Enrollment failed';
      if (e.response?.data?.error === 'CONFLICT' || msg.includes('Already enrolled')) navigate('/student/dashboard');
      else toast.error(msg);
      setEnrolling(false);
    },
  });

  function handleEnroll() {
    if (!user) { navigate(`/register?redirect=/courses/${id}&course=${id}`); return; }
    if (user.role !== 'student') { navigate(`/${user.role}/dashboard`); return; }
    if (Number(course.price) > 0) { setPaying(true); return; }
    setEnrolling(true);
    enrollMutation.mutate();
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7F3' }}>
        <PublicNav />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7F3' }}>
        <PublicNav />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#0C2014' }}>Course not found</h1>
          <p style={{ color: '#6b7280', margin: '.75rem 0 1.5rem' }}>This course may have been removed or is no longer active.</p>
          <Link to="/courses" className="btn-primary btn-sm" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none' }}>Browse Courses</Link>
        </div>
      </div>
    );
  }

  const formattedPrice = Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free';
  const nextBatch = batches[0];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7F3', fontFamily: "'Manrope', sans-serif" }}>
      <SEO
        title={`${course.title} — IGO Academy`}
        description={course.short_description || course.description?.slice(0, 155) || `Learn ${course.title} with IGO Academy — practical, industry-focused agri-skill training.`}
        path={`/courses/${id}`}
      />
      <PublicNav />

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #0C2014 0%, #1a3d26 100%)', padding: '3.5rem 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {course.category && <span className="badge badge-green">{course.category}</span>}
            {course.level && <span className="badge" style={{ background: 'rgba(218,165,32,.15)', color: '#DAA520' }}>{course.level}</span>}
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: 'white', marginBottom: '.75rem' }}>
            {course.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.95rem', maxWidth: 640 }}>
            {course.short_description || 'Practical, industry-focused agri-skill training with real farm experience.'}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {course.duration_hours && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.7)', fontSize: '.85rem' }}>
                <Clock size={15} color="#DAA520" /> {course.duration_hours}h duration
              </span>
            )}
            {course.level && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.7)', fontSize: '.85rem' }}>
                <BarChart3 size={15} color="#DAA520" /> {course.level}
              </span>
            )}
            {course.trainer_name && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.7)', fontSize: '.85rem' }}>
                <Users size={15} color="#DAA520" /> Trainer: {course.trainer_name}
              </span>
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 340px)', gap: '2.5rem' }}>

        {/* Main content */}
        <div>
          <Section title="Course Overview">
            <p style={{ color: '#4C5B50', fontSize: '.95rem', lineHeight: 1.75 }}>
              {course.description || course.short_description || 'Detailed course information coming soon — enquire below for more.'}
            </p>
          </Section>

          {course.prerequisites && (
            <Section title="Eligibility">
              <p style={{ color: '#4C5B50', fontSize: '.95rem', lineHeight: 1.75 }}>{course.prerequisites}</p>
            </Section>
          )}

          {course.modules?.length > 0 && (
            <Section title="Curriculum">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {course.modules.map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '.9rem', background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, padding: '.9rem 1.1rem' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f5e8', color: '#2d6a14', fontWeight: 800, fontSize: '.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#0C2014' }}>{m.title}</div>
                      {m.description && <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 2 }}>{m.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Certification">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', background: 'white', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '1.2rem' }}>
              <Award size={28} color="#DAA520" strokeWidth={1.5} />
              <p style={{ color: '#4C5B50', fontSize: '.88rem', margin: 0, lineHeight: 1.6 }}>
                Pass the assessment with 70%+ to earn a TNSDC + MSME recognised, QR-verified digital certificate you can share or verify online.
              </p>
            </div>
          </Section>

          <Section title="Career & Entrepreneurship Support">
            <p style={{ color: '#4C5B50', fontSize: '.9rem', lineHeight: 1.7 }}>
              Completing this course connects you to IGO Academy's Career Path (training → certification → internship → placement support)
              and Business Path (training → planning → farm setup → technical guidance) — reach out via the enquiry form to learn more.
            </p>
          </Section>

          <Section title="Have Questions?">
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(0,0,0,.06)' }}>
              <EnquiryForm defaultCourse={course.title} compact />
            </div>
          </Section>
        </div>

        {/* Sticky sidebar */}
        <div>
          <div style={{ position: 'sticky', top: 90, background: 'white', borderRadius: 18, padding: '1.5rem', border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 12, marginBottom: '1.25rem' }} />
            )}
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0C2014', fontFamily: "'Sora', sans-serif", marginBottom: '.25rem' }}>
              {formattedPrice}
            </div>
            {nextBatch && (
              <div style={{ fontSize: '.78rem', color: '#6b7280', marginBottom: '1rem' }}>
                Next batch: {nextBatch.start_date ? dayjs(nextBatch.start_date).format('DD MMM YYYY') : 'Rolling admission'}
                {nextBatch.mode ? ` · ${nextBatch.mode}` : ''}
              </div>
            )}
            <button
              className="btn-primary btn-sm"
              style={{ width: '100%', marginBottom: '.6rem' }}
              disabled={enrolling}
              onClick={handleEnroll}
            >
              {enrolling ? 'Enrolling…' : 'Enroll Now'}
            </button>
            <button
              className="btn-outline btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => navigate('/contact')}
            >
              <MessageCircle size={15} /> Enquire First
            </button>
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {['TNSDC + MSME recognised', 'Practical, hands-on training', 'Certificate on completion'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.8rem', color: '#4C5B50' }}>
                  <CheckCircle size={14} color="#16a34a" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal course={course} isOpen={paying} onClose={() => setPaying(false)} />
      <FloatingWhatsApp />
      <MobileStickyBar />
    </div>
  );
}

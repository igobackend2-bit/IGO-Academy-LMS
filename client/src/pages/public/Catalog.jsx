/**
 * Public Course Catalog
 * Accessible without login — shows all active IGO Academy courses
 * with category/level filters and enrollment CTA.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import PaymentModal from '@/components/features/PaymentModal';
import PublicNav from '@/components/layout/PublicNav';

// ── Constants ──────────────────────────────────────────────────
const CATEGORIES = ['All', 'Horticulture', 'Aquaculture', 'Agri-Business', 'Agri-Tech', 'Organic Farming', 'Livestock & Dairy', 'Irrigation & Water'];
const LEVELS     = ['All', 'beginner', 'intermediate', 'advanced'];

const CAT_EMOJI = {
  Horticulture:      '🌱',
  Aquaculture:       '🐟',
  'Agri-Business':   '📦',
  'Agri-Tech':       '💧',
  'Organic Farming': '🌿',
  'Livestock & Dairy': '🐄',
  'Irrigation & Water': '💦',
};

const LEVEL_COLOR = {
  beginner:     { background: 'rgba(79,160,46,0.15)',  color: '#2d6a14' },
  intermediate: { background: 'rgba(217,119,6,0.15)',  color: '#92400e' },
  advanced:     { background: 'rgba(220,38,38,0.13)',  color: '#991b1b' },
};

// ── Helpers ────────────────────────────────────────────────────
function formatPrice(price) {
  const n = Number(price);
  if (!n || n <= 0) return null;
  return '₹' + n.toLocaleString('en-IN');
}

function capFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Sub-components ─────────────────────────────────────────────
function NavBar() {
  return (
    <nav style={{
      position:       'sticky',
      top:            0,
      zIndex:         100,
      background:     'white',
      boxShadow:      '0 2px 12px rgba(13,38,25,.08)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '.85rem 2rem',
    }}>
      <Link
        to="/courses"
        style={{ textDecoration: 'none', color: 'var(--navy-dark)', fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-.02em' }}
      >
        IGO Academy
      </Link>
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-outline btn-sm" style={{ width: 'auto' }}>Sign In</button>
        </Link>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="btn-primary btn-sm" style={{ width: 'auto' }}>Get Started</button>
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #0C2014 0%, #235C39 100%)',
      padding:    '3.5rem 2rem',
      textAlign:  'center',
      color:      'white',
    }}>
      <h1 style={{
        fontFamily:   "'Sora',sans-serif",
        fontSize:     'clamp(1.6rem, 4vw, 2.5rem)',
        fontWeight:   900,
        marginBottom: '.75rem',
        letterSpacing: '-.03em',
      }}>
        Learn Agri-Entrepreneurship Online
      </h1>
      <p style={{
        color:        'rgba(255,255,255,0.72)',
        fontSize:     '1rem',
        maxWidth:     '560px',
        margin:       '0 auto 1.75rem',
        lineHeight:   1.6,
      }}>
        TNSDC + MSME recognised courses for students, entrepreneurs &amp; rural innovators
      </p>
      <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{
          background:   'rgba(141,198,63,0.18)',
          border:       '1px solid rgba(141,198,63,0.4)',
          color:        '#B5DB7A',
          padding:      '.45rem 1.2rem',
          borderRadius: '999px',
          fontSize:     '.85rem',
          fontWeight:   700,
        }}>
          6+ Courses
        </span>
        <span style={{
          background:   'rgba(218,165,32,0.18)',
          border:       '1px solid rgba(218,165,32,0.4)',
          color:        '#DAA520',
          padding:      '.45rem 1.2rem',
          borderRadius: '999px',
          fontSize:     '.85rem',
          fontWeight:   700,
        }}>
          3 Certificate Types
        </span>
      </div>
    </section>
  );
}

function FilterBar({ catFilter, setCatFilter, levelFilter, setLevelFilter }) {
  const pill = (active) => ({
    padding:      '.35rem .95rem',
    borderRadius: '999px',
    fontSize:     '.8rem',
    fontWeight:   700,
    cursor:       'pointer',
    border:       active ? 'none' : '1.5px solid var(--gray-200)',
    background:   active ? 'var(--navy-dark)' : 'white',
    color:        active ? 'white' : 'var(--gray-600)',
    transition:   'all .18s ease',
  });

  return (
    <div style={{
      background:    'white',
      borderBottom:  '1px solid var(--gray-200)',
      padding:       '.85rem 2rem',
      position:      'sticky',
      top:           '64px',
      zIndex:        90,
      display:       'flex',
      gap:           '1.5rem',
      flexWrap:      'wrap',
      alignItems:    'center',
    }}>
      {/* Category */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.07em', marginRight: '.25rem' }}>Category</span>
        {CATEGORIES.map(cat => (
          <button key={cat} style={pill(catFilter === cat)} onClick={() => setCatFilter(cat)}>
            {cat !== 'All' && CAT_EMOJI[cat] ? CAT_EMOJI[cat] + ' ' : ''}{cat}
          </button>
        ))}
      </div>

      {/* Level */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.07em', marginRight: '.25rem' }}>Level</span>
        {LEVELS.map(lv => (
          <button key={lv} style={pill(levelFilter === lv)} onClick={() => setLevelFilter(lv)}>
            {capFirst(lv)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course, index, onEnroll, enrollingId }) {
  const formatted = formatPrice(course.price);
  const isEnrolling = enrollingId === course.id;

  return (
    <div
      className="card-enter"
      style={{
        animationDelay:  `${index * 80}ms`,
        background:      'white',
        borderRadius:    '18px',
        border:          '1px solid var(--gray-200)',
        boxShadow:       'var(--shadow-sm)',
        overflow:        'hidden',
        transition:      'all .22s ease',
        display:         'flex',
        flexDirection:   'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-4px)';
        e.currentTarget.style.boxShadow  = '0 12px 32px rgba(13,38,25,.13), 0 0 0 1px rgba(79,160,46,.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Card Thumbnail Image */}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: '#f6f8f5' }}>
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ height: '100%', background: 'linear-gradient(135deg,#0C2014,#235C39)' }} />
        )}
        {/* Subtle dark overlay for badges contrast */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 60%)' }} />
        
      </div>

      {/* Card body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '.65rem' }}>
        {/* Title */}
        <h3 style={{
          color:        'var(--navy-dark)',
          fontWeight:   700,
          fontSize:     '1.05rem',
          fontFamily:   "'Sora',sans-serif",
          lineHeight:   1.35,
          margin:       0,
        }}>
          {course.title}
        </h3>

        {/* Meta data */}
        <p style={{ color: 'var(--gray-400)', fontSize: '.76rem', margin: 0 }}>
          ⏱ {course.duration_hours ? `${course.duration_hours}h` : '—'}
          {course.modules_count > 0 ? ` · 📦 ${course.modules_count} module${course.modules_count !== 1 ? 's' : ''}` : ''}
          {course.trainer_name ? ` · 👨‍🏫 ${course.trainer_name}` : ''}
        </p>

        {/* Short description */}
        <p style={{
          color:             'var(--gray-600)',
          fontSize:          '.82rem',
          lineHeight:        1.55,
          overflow:          'hidden',
          display:           '-webkit-box',
          WebkitLineClamp:   2,
          WebkitBoxOrient:   'vertical',
          margin:            0,
          flex:              1,
        }}>
          {course.short_description || 'Discover expert-led agri-entrepreneurship content designed for hands-on learners.'}
        </p>

        {/* Category & Level Badges */}
        <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap', marginTop: 'auto', marginBottom: '.35rem' }}>
          {course.category && (
            <span className="badge badge-green" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
              {CAT_EMOJI[course.category] || ''} {course.category}
            </span>
          )}
          {course.level && (
            <span className="badge" style={{ ...LEVEL_COLOR[course.level], borderRadius: '999px', padding: '4px 10px', fontSize: '0.72rem' }}>
              {capFirst(course.level)}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem' }}>
          {/* Price */}
          <div>
            {formatted ? (
              <span style={{ color: 'var(--navy-dark)', fontWeight: 900, fontSize: '1.25rem', fontFamily: "'Sora',sans-serif" }}>
                {formatted}
              </span>
            ) : (
              <span className="badge badge-green" style={{ fontSize: '.78rem', padding: '4px 12px' }}>Free</span>
            )}
          </div>

          {/* Enroll button */}
          <button
            className="btn-primary btn-sm"
            style={{ width: 'auto', minWidth: '110px' }}
            disabled={isEnrolling}
            onClick={() => onEnroll(course)}
          >
            {isEnrolling ? 'Enrolling…' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Catalog() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [catFilter,   setCatFilter]   = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [enrollingId, setEnrollingId] = useState(null);
  const [payingCourse, setPayingCourse] = useState(null);

  // Fetch courses
  const { data: rawCourses = [], isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn:  () => api.get('/courses/public').then(r => r.data.data || []),
    staleTime: 5 * 60 * 1000,
  });

  // Free enrollment mutation (student only)
  const enrollMutation = useMutation({
    mutationFn: (courseId) => api.post('/enrollments/self', { course_id: courseId }),
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
      setEnrollingId(null);
    },
  });

  // Filter courses client-side
  const courses = rawCourses.filter(c => {
    const catOk   = catFilter   === 'All' || c.category === catFilter;
    const levelOk = levelFilter === 'All' || c.level    === levelFilter;
    return catOk && levelOk;
  });

  function handleEnroll(course) {
    // Not logged in — send to register with course context so they can come back
    if (!user) {
      navigate(`/register?redirect=/courses&course=${course.id}`);
      return;
    }
    // Admin/trainer viewing catalog — redirect to their dashboard
    if (user.role !== 'student') {
      navigate(`/${user.role}/dashboard`);
      return;
    }
    // Paid course + logged-in student — open payment modal
    const price = Number(course.price);
    if (price > 0) {
      setPayingCourse(course);
      return;
    }
    // Free course + logged-in student
    setEnrollingId(course.id);
    enrollMutation.mutate(course.id);
  }

  function clearFilters() {
    setCatFilter('All');
    setLevelFilter('All');
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: '#F5F7F3' }}>
      <PublicNav />
      <HeroSection />
      <FilterBar
        catFilter={catFilter}
        setCatFilter={setCatFilter}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
      />

      {/* Course grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '18px' }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign:    'center',
            padding:      '4rem 2rem',
            background:   'white',
            borderRadius: '18px',
            border:       '1px solid var(--gray-200)',
            boxShadow:    'var(--shadow-sm)',
          }}>
            <svg viewBox="0 0 80 80" width="64" style={{ margin: '0 auto 1rem', display: 'block', opacity: .5 }}>
              <circle cx="40" cy="40" r="30" fill="none" stroke="var(--gray-200)" strokeWidth="3"/>
              <path d="M28 44 Q40 32 52 44" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="32" cy="34" r="3" fill="var(--gray-400)"/>
              <circle cx="48" cy="34" r="3" fill="var(--gray-400)"/>
            </svg>
            <p style={{ color: 'var(--navy)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '.4rem' }}>
              No courses match your filters
            </p>
            <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginBottom: '1.25rem' }}>
              Try adjusting the category or level above.
            </p>
            <button className="btn-outline btn-sm" style={{ width: 'auto' }} onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                onEnroll={handleEnroll}
                enrollingId={enrollingId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background:  '#0C2014',
        color:       'rgba(255,255,255,0.65)',
        textAlign:   'center',
        padding:     '1.5rem 1rem',
        fontSize:    '.82rem',
        marginTop:   '2rem',
      }}>
        &copy; IGO Academy 2026 | TNSDC + MSME Recognised | Chennai, Tamil Nadu
      </footer>

      {/* Payment modal — shown when student clicks Enroll Now on a paid course */}
      <PaymentModal
        course={payingCourse}
        isOpen={!!payingCourse}
        onClose={() => setPayingCourse(null)}
      />
    </div>
  );
}

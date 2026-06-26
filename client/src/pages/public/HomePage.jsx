/**
 * HomePage — Public landing page for IGO Academy
 * Route: /
 * Sections: Hero → Categories → Featured Courses → Why IGO → CTA → Footer
 */
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import PublicNav from '@/components/layout/PublicNav';

// ── Category data ────────────────────────────────────────────────
const CATEGORIES = [
  {
    icon:        '🌱',
    name:        'Horticulture',
    description: 'Plant & crop cultivation techniques',
    count:       '2+ Courses',
  },
  {
    icon:        '🐟',
    name:        'Aquaculture',
    description: 'Fish farming & water management',
    count:       '2+ Courses',
  },
  {
    icon:        '📦',
    name:        'Agri-Biz',
    description: 'Supply chain & market strategies',
    count:       '1+ Courses',
  },
  {
    icon:        '💧',
    name:        'Tech',
    description: 'Smart irrigation & precision farming',
    count:       '1+ Courses',
  },
];

// ── Why cards ────────────────────────────────────────────────────
const WHY_CARDS = [
  {
    icon:  '🏛️',
    title: 'TNSDC + MSME Recognised',
    text:  'Certification accepted by Tamil Nadu Skill Development Corporation and MSME — adds real weight to your resume.',
  },
  {
    icon:  '👨‍🏫',
    title: 'Industry Expert Faculty',
    text:  'Learn from active agri-practitioners and entrepreneurs who have built successful businesses.',
  },
  {
    icon:  '🎓',
    title: 'Certificate on Completion',
    text:  'Pass the assessment with 70%+ and instantly download your QR-verified digital certificate.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────
function formatPrice(price) {
  const n = Number(price);
  if (!n || n <= 0) return 'Free';
  return '₹' + n.toLocaleString('en-IN');
}

// ── Featured course card ─────────────────────────────────────────
function CourseCard({ course, onEnroll }) {
  return (
    <div
      style={{
        borderRadius: '18px',
        overflow:     'hidden',
        border:       '1px solid #e5e7eb',
        background:   'white',
        cursor:       'pointer',
        transition:   'transform .2s, box-shadow .2s',
        display:      'flex',
        flexDirection:'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(12,32,20,.15), 0 0 0 2px rgba(79,160,46,.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0C2014,#235C39)',
          padding:    '2rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
          {course.category && (
            <span style={{
              background:   'rgba(141,198,63,0.2)',
              border:       '1px solid rgba(141,198,63,0.35)',
              color:        '#8DC63F',
              fontSize:     '.7rem',
              fontWeight:   700,
              padding:      '2px 10px',
              borderRadius: '20px',
            }}>
              {course.category}
            </span>
          )}
          {course.level && (
            <span style={{
              background:   'rgba(255,255,255,0.12)',
              color:        'rgba(255,255,255,0.8)',
              fontSize:     '.7rem',
              fontWeight:   600,
              padding:      '2px 10px',
              borderRadius: '20px',
            }}>
              {course.level}
            </span>
          )}
        </div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>
          {course.title}
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {course.short_description && (
          <p style={{
            color:        '#6b7280',
            fontSize:     '.82rem',
            lineHeight:   1.5,
            marginBottom: '.75rem',
            flex:         1,
            display:      '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:     'hidden',
          }}>
            {course.short_description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
          <span style={{ color: '#4FA02E', fontWeight: 800, fontSize: '.95rem' }}>
            {formatPrice(course.price)}
          </span>
          {course.duration_hours && (
            <span style={{ color: '#9ca3af', fontSize: '.75rem' }}>
              {course.duration_hours}h
            </span>
          )}
        </div>
        <button
          onClick={onEnroll}
          style={{
            background:   'linear-gradient(135deg,#2d6a14,#4FA02E)',
            color:        'white',
            border:       'none',
            borderRadius: '10px',
            padding:      '.6rem 1rem',
            fontWeight:   700,
            fontSize:     '.85rem',
            cursor:       'pointer',
            width:        '100%',
          }}
        >
          Enroll Now →
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const { data: coursesData } = useQuery({
    queryKey: ['pub-courses'],
    queryFn:  () => api.get('/courses/public').then(r => r.data.data),
  });

  const featuredCourses = (coursesData || []).slice(0, 3);

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif" }}>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <PublicNav />

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight:     'calc(100vh - 64px)',
          position:      'relative',
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
        }}
      >
        {/* Background image with Ken Burns */}
        <div
          className="lp-video-bg"
          style={{
            position: 'absolute',
            inset:    0,
          }}
        />

        {/* Dark overlay */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: 'rgba(12,32,20,0.72)',
            zIndex:     1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position:       'relative',
            zIndex:         2,
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '6rem 1.5rem 4rem',
            textAlign:      'center',
          }}
        >
          {/* Badge */}
          <span
            style={{
              display:       'inline-block',
              background:    'rgba(141,198,63,0.2)',
              border:        '1px solid rgba(141,198,63,0.4)',
              color:         '#8DC63F',
              fontSize:      '.75rem',
              fontWeight:    700,
              padding:       '5px 16px',
              borderRadius:  '20px',
              marginBottom:  '1.5rem',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}
          >
            TNSDC + MSME Recognised Platform
          </span>

          {/* H1 */}
          <h1
            style={{
              fontSize:     'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight:   900,
              color:        'white',
              lineHeight:   1.1,
              marginBottom: '1.25rem',
              fontFamily:   "'Sora', sans-serif",
            }}
          >
            Grow. Learn. Lead.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize:     '1.05rem',
              color:        'rgba(255,255,255,0.75)',
              maxWidth:     '560px',
              margin:       '0 auto 2.5rem',
              lineHeight:   1.65,
            }}
          >
            India's agri-entrepreneurship learning platform — TNSDC + MSME recognised
            certification for students, farmers &amp; entrepreneurs across Tamil Nadu.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display:        'flex',
              gap:            '1rem',
              justifyContent: 'center',
              flexWrap:       'wrap',
            }}
          >
            <button
              onClick={() => navigate('/courses')}
              style={{
                background:   'linear-gradient(135deg,#2d6a14,#4FA02E)',
                color:        'white',
                padding:      '.85rem 2rem',
                borderRadius: '12px',
                fontWeight:   700,
                border:       'none',
                cursor:       'pointer',
                fontSize:     '.95rem',
              }}
            >
              Explore Courses →
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background:   'rgba(255,255,255,0.1)',
                border:       '1.5px solid rgba(255,255,255,0.45)',
                color:        'white',
                padding:      '.85rem 1.75rem',
                borderRadius: '12px',
                fontWeight:   600,
                cursor:       'pointer',
                fontSize:     '.95rem',
              }}
            >
              Sign In
            </button>
          </div>

          {/* Stats row */}
          <div
            style={{
              marginTop:             '4rem',
              display:               'grid',
              gridTemplateColumns:   'repeat(4, auto)',
              gap:                   '3rem',
              justifyContent:        'center',
            }}
          >
            {[
              { number: '6+',   label: 'Courses' },
              { number: '4',    label: 'Categories' },
              { number: 'TNSDC', label: 'Recognised' },
              { number: 'MSME', label: 'Certified' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize:      '.75rem',
                  color:         'rgba(255,255,255,0.6)',
                  marginTop:     '.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — CATEGORY CARDS
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <h2
          style={{
            fontSize:     '1.75rem',
            fontWeight:   900,
            color:        '#0C2014',
            textAlign:    'center',
            marginBottom: '.75rem',
            fontFamily:   "'Sora', sans-serif",
          }}
        >
          Learn by Domain
        </h2>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '3rem' }}>
          Choose your area of expertise
        </p>

        <div
          style={{
            display:               'grid',
            gridTemplateColumns:   'repeat(auto-fill, minmax(220px, 1fr))',
            gap:                   '1.5rem',
            maxWidth:              '960px',
            margin:                '0 auto',
          }}
        >
          {CATEGORIES.map(cat => (
            <div
              key={cat.name}
              onClick={() => navigate('/courses')}
              style={{
                borderRadius: '18px',
                overflow:     'hidden',
                border:       '1px solid #e5e7eb',
                cursor:       'pointer',
                transition:   'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(12,32,20,.15), 0 0 0 2px rgba(79,160,46,.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card top */}
              <div
                style={{
                  background: 'linear-gradient(135deg,#0C2014,#235C39)',
                  padding:    '2rem 1.5rem',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>
                  {cat.icon}
                </div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>
                  {cat.name}
                </div>
              </div>

              {/* Card bottom */}
              <div style={{ padding: '1.25rem' }}>
                <p style={{
                  color:        '#6b7280',
                  fontSize:     '.82rem',
                  lineHeight:   1.5,
                  marginBottom: '.75rem',
                }}>
                  {cat.description}
                </p>
                <span style={{
                  background:   '#e8f5e8',
                  color:        '#2d6a14',
                  fontSize:     '.72rem',
                  fontWeight:   700,
                  padding:      '3px 10px',
                  borderRadius: '20px',
                }}>
                  {cat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — FEATURED COURSES
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F5F7F3', padding: '5rem 2rem' }}>
        <h2
          style={{
            fontSize:     '1.75rem',
            fontWeight:   900,
            color:        '#0C2014',
            textAlign:    'center',
            marginBottom: '.75rem',
            fontFamily:   "'Sora', sans-serif",
          }}
        >
          Featured Courses
        </h2>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '3rem' }}>
          Start learning today — TNSDC &amp; MSME recognised certificates
        </p>

        {featuredCourses.length > 0 ? (
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap:                 '1.5rem',
              maxWidth:            '960px',
              margin:              '0 auto',
            }}
          >
            {featuredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={() => navigate('/courses')}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display:        'flex',
              justifyContent: 'center',
              gap:            '1.5rem',
              flexWrap:       'wrap',
              maxWidth:       '960px',
              margin:         '0 auto',
            }}
          >
            {/* Placeholder skeletons while loading */}
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width:        '280px',
                  height:       '280px',
                  borderRadius: '18px',
                  background:   'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
                  backgroundSize: '200% 100%',
                  animation:    'shimmer 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button
            onClick={() => navigate('/courses')}
            style={{
              background:   'transparent',
              border:       '1.5px solid #235C39',
              color:        '#235C39',
              padding:      '.75rem 2rem',
              borderRadius: '12px',
              fontWeight:   700,
              fontSize:     '.95rem',
              cursor:       'pointer',
            }}
          >
            View All Courses →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — WHY IGO ACADEMY
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '4rem 2rem' }}>
        <h2
          style={{
            fontSize:     '1.75rem',
            fontWeight:   900,
            color:        '#0C2014',
            textAlign:    'center',
            marginBottom: '3rem',
            fontFamily:   "'Sora', sans-serif",
          }}
        >
          Why Choose IGO Academy?
        </h2>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap:                 '1.5rem',
            maxWidth:            '860px',
            margin:              '0 auto',
          }}
        >
          {WHY_CARDS.map(card => (
            <div
              key={card.title}
              style={{
                background:   '#f8fdf8',
                border:       '1px solid #d0e8d0',
                borderRadius: '16px',
                padding:      '2rem 1.5rem',
                textAlign:    'center',
              }}
            >
              <div
                style={{
                  width:          '56px',
                  height:         '56px',
                  borderRadius:   '50%',
                  background:     '#e8f5e8',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  margin:         '0 auto .75rem',
                  fontSize:       '1.5rem',
                }}
              >
                {card.icon}
              </div>
              <h3
                style={{
                  fontWeight:   800,
                  color:        '#0C2014',
                  marginBottom: '.5rem',
                  fontFamily:   "'Sora', sans-serif",
                  fontSize:     '1rem',
                }}
              >
                {card.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '.875rem', lineHeight: 1.6 }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg,#0C2014,#1a4a2e)',
          padding:    '5rem 2rem',
          textAlign:  'center',
        }}
      >
        <h2
          style={{
            color:        'white',
            fontWeight:   900,
            fontSize:     '1.75rem',
            marginBottom: '1rem',
            fontFamily:   "'Sora', sans-serif",
          }}
        >
          Ready to Start Your Agri Journey?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          Join hundreds of students and entrepreneurs learning agri-skills online.
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            background:   'linear-gradient(135deg,#2d6a14,#4FA02E)',
            color:        'white',
            fontWeight:   700,
            fontSize:     '1rem',
            padding:      '1rem 2.5rem',
            border:       'none',
            borderRadius: '12px',
            cursor:       'pointer',
          }}
        >
          Get Started Free →
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer
        style={{
          background: '#0C2014',
          color:      'white',
          padding:    '3rem 2rem 1.5rem',
        }}
      >
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            flexWrap:       'wrap',
            gap:            '2rem',
            maxWidth:       '960px',
            margin:         '0 auto',
          }}
        >
          {/* Left */}
          <div>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 900,
                fontSize:   '1.1rem',
                color:      'white',
                marginBottom: '.4rem',
              }}
            >
              IGO Academy
            </div>
            <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,0.6)', marginBottom: '.5rem' }}>
              A platform by IGO Group, Chennai
            </div>
            <div style={{ fontSize: '.88rem', color: '#8DC63F', fontWeight: 700 }}>
              Grow. Learn. Lead.
            </div>
          </div>

          {/* Right: links */}
          <div
            style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           '.6rem',
            }}
          >
            {[
              { label: 'Courses',            to: '/courses' },
              { label: 'Sign In',            to: '/login' },
              { label: 'Register',           to: '/register' },
              { label: 'About IGO Group',     to: '/' },
            ].map(link => (
              <span
                key={link.label}
                onClick={() => navigate(link.to)}
                style={{
                  color:          'rgba(255,255,255,0.65)',
                  fontSize:       '.85rem',
                  cursor:         'pointer',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#8DC63F'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop:   '1px solid rgba(255,255,255,.1)',
            marginTop:   '2rem',
            paddingTop:  '1.25rem',
            textAlign:   'center',
            color:       'rgba(255,255,255,.35)',
            fontSize:    '.75rem',
            maxWidth:    '960px',
            margin:      '2rem auto 0',
          }}
        >
          &copy; 2026 IGO Academy. TNSDC + MSME Recognised | Chennai, Tamil Nadu
        </div>
      </footer>

      {/* Shimmer keyframe for skeleton loaders */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  );
}

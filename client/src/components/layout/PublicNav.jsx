/**
 * PublicNav — Sticky top navigation bar for all public pages.
 * Used on HomePage, Catalog, and CourseDetail. Reads auth state internally.
 * Nav structure follows the website refinement spec, Section 3.1 — Home,
 * About Us, Programs, Workshops, Corporate Training, Student Success,
 * Careers, Contact, plus a visually distinct "Apply Now" CTA. Student
 * Success links to its own dedicated page (/student-success, added 26 Aug
 * 2026 with real IGO Academy trainees now working within IGO Group) —
 * the homepage keeps a shorter teaser at id="student-success" that links
 * through to the same page. IGO Group and the old Practical
 * Training/Career & Entrepreneurship top-level links were dropped per the
 * spec's "keep the primary menu short" instruction — those pages/sections
 * remain reachable by URL, just not from the nav.
 * Below 1250px (Section 12 Mobile UX) the center links + right auth buttons
 * are replaced by a hamburger toggle opening a full mobile nav panel — with
 * 8 nav labels plus the Apply Now/Sign In/Get Started buttons, the full row
 * genuinely doesn't fit narrower than that without crowding, so the
 * breakpoint sits well above the usual 768px phone/tablet cutoff.
 */
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  ['Home', '/'],
  ['About Us', '/about'],
  ['Programs', '/courses'],
  ['Workshops', '/workshops'],
  ['Corporate Training', '/for-colleges'],
  ['Student Success', '/student-success'],
  ['Careers', '/careers'],
  ['Contact', '/contact'],
];

export default function PublicNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(path) {
    setMobileOpen(false);
    navigate(path);
  }

  /**
   * Enquire Now is its own page (/enquire), separate from /contact. Must
   * visibly do something whether you're already there (React Router won't
   * re-navigate to the same route, so a plain <Link> silently does nothing)
   * or coming from another page.
   */
  function goToEnquiry() {
    setMobileOpen(false);
    const scroll = () => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.pathname === '/enquire') {
      scroll();
    } else {
      navigate('/enquire');
      setTimeout(scroll, 120);
    }
  }

  return (
    <nav
      style={{
        position:        'sticky',
        top:             0,
        zIndex:          100,
        background:      'white',
        boxShadow:       '0 1px 0 rgba(0,0,0,.08)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        height:          '64px',
        padding:         '0 1.5rem',
      }}
    >
      {/* ── Left: brand (logo + wordmark) ── */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', flexShrink: 0, minWidth: 0 }}
      >
        <img
          src="/igo-logo.png"
          alt="IGO Academy"
          style={{ height: 36, display: 'block', flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span
          className="public-nav-wordmark"
          style={{
            fontFamily:    "'Sora', sans-serif",
            fontWeight:    900,
            fontSize:      '1.1rem',
            letterSpacing: '-.02em',
            color:         '#0C2014',
            whiteSpace:    'nowrap',
          }}
        >
          IGO Academy
        </span>
      </div>

      {/* ── Center: nav links (hidden below the 1250px breakpoint) ── */}
      <div
        style={{
          display:    'flex',
          gap:        '1.1rem',
          alignItems: 'center',
          flexShrink: 0,
        }}
        className="public-nav-links"
      >
        {NAV_LINKS.map(([label, to]) => (
          <Link
            key={label}
            to={to}
            style={{
              textDecoration: 'none',
              color:          '#0C2014',
              fontWeight:     700,
              fontSize:       '.82rem',
              whiteSpace:     'nowrap',
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Right: Apply Now CTA + auth buttons (hidden below the 1250px breakpoint, replaced by hamburger) ── */}
      <div className="public-nav-right" style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={goToEnquiry}
          className="btn-primary btn-sm"
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center' }}
        >
          Apply Now
        </button>
        {user ? (
          user.role === 'admin' || user.role === 'trainer' ? (
            <button
              className="btn-primary btn-sm"
              style={{ width: 'auto' }}
              onClick={() => navigate('/admin/dashboard')}
            >
              Admin Panel
            </button>
          ) : (
            <button
              className="btn-primary btn-sm"
              style={{ width: 'auto' }}
              onClick={() => navigate('/student/dashboard')}
            >
              My Dashboard
            </button>
          )
        ) : (
          <>
            <button
              className="btn-outline btn-sm"
              style={{ width: 'auto' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              className="btn-primary btn-sm"
              style={{ width: 'auto' }}
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
          </>
        )}
      </div>

      {/* ── Hamburger toggle — shown only below the 1250px breakpoint ── */}
      <button
        className="public-nav-hamburger"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen(v => !v)}
        style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          padding: '.4rem', color: '#0C2014', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ── Mobile dropdown panel — same links + auth actions, shown below the 1250px breakpoint when open ── */}
      {mobileOpen && (
        <div
          className="public-nav-mobile-panel"
          style={{
            position: 'absolute', top: '64px', left: 0, right: 0,
            background: 'white', boxShadow: '0 8px 24px rgba(13,38,25,.14)',
            display: 'flex', flexDirection: 'column', padding: '.5rem 0',
            maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
          }}
        >
          {NAV_LINKS.map(([label, to]) => (
            <Link
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                textDecoration: 'none', color: '#0C2014', fontWeight: 600,
                fontSize: '.95rem', padding: '.85rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,.05)',
              }}
            >
              {label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', padding: '1rem 1.5rem' }}>
            <button
              onClick={goToEnquiry}
              className="btn-primary btn-sm"
              style={{ textAlign: 'center' }}
            >
              Apply Now
            </button>
            {user ? (
              <button
                className="btn-outline btn-sm"
                onClick={() => go(user.role === 'admin' || user.role === 'trainer' ? '/admin/dashboard' : '/student/dashboard')}
              >
                {user.role === 'admin' || user.role === 'trainer' ? 'Admin Panel' : 'My Dashboard'}
              </button>
            ) : (
              <>
                <button className="btn-outline btn-sm" onClick={() => go('/login')}>Sign In</button>
                <button className="btn-primary btn-sm" onClick={() => go('/register')}>Get Started</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Responsive: swap center links + right buttons for a hamburger below
          1250px — 8 nav labels plus 3 right-side buttons need that much room
          to sit comfortably without crowding or overlapping. ── */}
      <style>{`
        @media (max-width: 1250px) {
          .public-nav-links { display: none !important; }
          .public-nav-right { display: none !important; }
          .public-nav-hamburger { display: flex !important; }
        }
        @media (max-width: 380px) {
          .public-nav-wordmark { font-size: .9rem !important; }
          nav { padding-left: 1rem !important; padding-right: 1rem !important; }
        }
      `}</style>
    </nav>
  );
}

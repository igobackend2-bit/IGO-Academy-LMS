/**
 * PublicNav — Sticky top navigation bar for all public pages.
 * Used on HomePage and Catalog. Reads auth state internally.
 */
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function PublicNav() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        padding:         '0 2rem',
      }}
    >
      {/* ── Left: brand (logo + wordmark) ── */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}
      >
        <img
          src="/igo-logo.png"
          alt="IGO Academy"
          style={{ height: 36, display: 'block' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span
          style={{
            fontFamily:    "'Sora', sans-serif",
            fontWeight:    900,
            fontSize:      '1.1rem',
            letterSpacing: '-.02em',
            color:         '#0C2014',
          }}
        >
          IGO Academy
        </span>
      </div>

      {/* ── Center: nav links (hidden <768px) ── */}
      <div
        style={{
          display:    'flex',
          gap:        '2rem',
          alignItems: 'center',
        }}
        className="public-nav-links"
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color:          '#4C5B50',
            fontWeight:     600,
            fontSize:       '.9rem',
          }}
        >
          Home
        </Link>
        <Link
          to="/courses"
          style={{
            textDecoration: 'none',
            color:          '#4C5B50',
            fontWeight:     600,
            fontSize:       '.9rem',
          }}
        >
          Courses
        </Link>
        <Link
          to="/igo-brands"
          style={{
            textDecoration: 'none',
            color:          '#4C5B50',
            fontWeight:     600,
            fontSize:       '.9rem',
          }}
        >
          IGO Group
        </Link>
      </div>

      {/* ── Right: auth buttons ── */}
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
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

      {/* ── Responsive: hide center links on mobile ── */}
      <style>{`
        @media (max-width: 767px) {
          .public-nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

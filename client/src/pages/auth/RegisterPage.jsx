import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/services/api';

/* ── Birds (reused from LoginPage) ──────────────────────────── */
function Birds() {
  return (
    <g className="lp-birds" opacity="0.38">
      <path d="M80 38 Q84 35 88 38" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <path d="M92 34 Q95 31.5 98 34" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <path d="M220 28 Q223 25.5 226 28" stroke="rgba(255,255,255,0.7)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
    </g>
  );
}

/* ── Landscape Panel (same Ken Burns background as LoginPage) ── */
function LandscapePanel() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 55;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random();
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: depth * 3.0 + 0.6,
        depth,
        vx: (Math.random() * 0.28 + 0.08) * (depth * 0.7 + 0.3),
        vy: -(Math.random() * 0.38 + 0.12) * (depth * 0.7 + 0.3),
        baseAlpha: Math.random() * 0.4 + 0.18,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 0.015 - 0.0075),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const sunX = width * 0.67;
      const sunY = height * 0.10;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.angle) * 0.12;
        p.y += p.vy;
        p.angle += p.spin;

        if (p.y < -20) { p.y = height + 20; p.x = Math.random() * width; }
        if (p.x > width + 20) { p.x = -20; p.y = Math.random() * height; }
        else if (p.x < -20) { p.x = width + 20; }

        const dx = p.x - sunX;
        const dy = p.y - sunY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sunRadius = width * 0.4;
        let glow = 1.0;
        if (dist < sunRadius) glow = 1.0 + (1.0 - dist / sunRadius) * 3.2;

        ctx.beginPath();
        const alpha = Math.min(0.85, p.baseAlpha * glow);
        let fillStyle;
        if (p.depth > 0.82) {
          fillStyle = `rgba(255, 215, 90, ${alpha * 0.14})`;
          ctx.arc(p.x, p.y, p.radius * 3.0, 0, Math.PI * 2);
        } else if (p.depth < 0.22) {
          fillStyle = `rgba(230, 250, 205, ${alpha * 0.38})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        } else {
          fillStyle = `rgba(255, 225, 110, ${alpha})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div className="lp-camera-rig" style={{
        position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%',
        width: '110%', height: '110%',
      }}>
        <div className="lp-video-bg" style={{ position: 'absolute', inset: 0 }} />

        <div className="lp-godrays" style={{
          position: 'absolute', top: '10%', left: '67%',
          transform: 'translate(-50%, -50%)', width: '150%', height: '150%',
          pointerEvents: 'none', mixBlendMode: 'screen',
        }}>
          <div className="lp-ray lp-ray-1" />
          <div className="lp-ray lp-ray-2" />
          <div className="lp-ray lp-ray-3" />
        </div>

        <svg className="lp-stars" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '45%' }}
          viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
          {[
            [350,15],[420,8],[480,22],[540,6],[580,18],
            [370,45],[435,52],[495,38],[560,50],[590,32]
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={i % 2 === 0 ? 1.0 : 0.6}
              fill="white" opacity={0.35 + (i * 0.03)}
              style={{ animation: `starTwinkle ${3 + i % 3}s ease-in-out infinite ${i * 0.4}s` }} />
          ))}
        </svg>

        <div className="lp-mist-a" style={{
          position: 'absolute', top: '25%', left: '-15%', right: '-15%', height: '18%',
          background: 'linear-gradient(180deg,transparent,rgba(220,238,190,0.22),transparent)',
          filter: 'blur(24px)', mixBlendMode: 'screen',
        }} />
        <div className="lp-mist-b" style={{
          position: 'absolute', top: '35%', left: '-8%', right: '-8%', height: '14%',
          background: 'linear-gradient(180deg,transparent,rgba(200,218,170,0.18),transparent)',
          filter: 'blur(30px)', mixBlendMode: 'screen',
        }} />

        <canvas ref={canvasRef} style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', mixBlendMode: 'screen',
        }} />

        <svg className="lp-foreground" style={{
          position: 'absolute', bottom: '-3%', left: '-3%',
          width: '106%', height: '24%', pointerEvents: 'none', zIndex: 10,
        }} viewBox="0 0 475 140" preserveAspectRatio="none">
          <Birds />
          {[
            { x: 30,  h: 96,  blur: 4.2 },
            { x: 130, h: 108, blur: 5.0 },
            { x: 360, h: 102, blur: 4.5 },
            { x: 430, h: 112, blur: 5.5 },
          ].map((s, i) => {
            const gold = '#FFA520';
            const stem = '#724c12';
            const delay = -1.2 - (s.x * 0.015);
            const duration = 2.4 + (i % 2) * 0.35;
            return (
              <g key={`fg-${i}`} style={{
                transformBox: 'fill-box', transformOrigin: 'center bottom',
                animation: `wsSwayCustom ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                '--sway-deg': '6.2deg',
                filter: `blur(${s.blur}px)`,
              }} opacity="0.38">
                <line x1={s.x} y1="140" x2={s.x} y2={140 - s.h} stroke={stem} strokeWidth="3.8" strokeLinecap="round" />
                <ellipse cx={s.x - 7} cy={140 - s.h * 0.55} rx="4.5" ry="9" fill={gold} opacity="0.6" transform={`rotate(-28,${s.x - 7},${140 - s.h * 0.55})`} />
                <ellipse cx={s.x + 7} cy={140 - s.h * 0.7}  rx="4.5" ry="8" fill={gold} opacity="0.6" transform={`rotate(22,${s.x + 7},${140 - s.h * 0.7})`} />
                <ellipse cx={s.x} cy={140 - s.h - 6} rx="5.5" ry="13" fill={gold} opacity="0.8" />
              </g>
            );
          })}
        </svg>
      </div>

      <style>{`
        .lp-camera-rig { animation: cameraDrift 45s ease-in-out infinite alternate; }
        @keyframes cameraDrift {
          0%   { transform: scale(1.02) translate(0px, 0px) rotate(0deg); }
          100% { transform: scale(1.08) translate(-6px, -3px) rotate(0.1deg); }
        }
        .lp-video-bg {
          background-image: url("/green_field_sunrise.png");
          background-size: cover; background-position: center;
          transform-origin: center;
          animation: bgParallax 45s ease-in-out infinite alternate;
        }
        @keyframes bgParallax {
          0%   { transform: translate(0px, 0px) scale(1);      filter: brightness(0.88) contrast(1.02) saturate(0.95); }
          100% { transform: translate(4px, -2px) scale(1.03);  filter: brightness(1.06) contrast(0.98) saturate(1.10); }
        }
        .lp-stars { animation: starsFade 24s ease-in-out infinite alternate, starsParallax 45s ease-in-out infinite alternate; transform-origin: center; }
        @keyframes starsFade   { 0% { opacity: 0.85 } 100% { opacity: 0.02 } }
        @keyframes starTwinkle { 0%,100% { opacity:.3 } 50% { opacity:.9 } }
        @keyframes starsParallax { 0% { transform: translate(0px, 0px); } 100% { transform: translate(3px, -1px); } }
        .lp-godrays { transform-origin: center; animation: raysPulse 14s ease-in-out infinite alternate, raysParallax 45s ease-in-out infinite alternate; }
        .lp-ray { position: absolute; inset: 0; background: conic-gradient(from -40deg at 50% 50%, transparent 0deg, rgba(255,230,160,0.07) 15deg, transparent 30deg, transparent 95deg, rgba(255,218,120,0.10) 115deg, transparent 135deg, transparent 210deg, rgba(255,230,160,0.05) 225deg, transparent 240deg, transparent 310deg, rgba(255,218,120,0.08) 328deg, transparent 344deg, transparent 360deg); border-radius: 50%; }
        .lp-ray-1 { animation: rayRotate1 70s linear infinite; }
        .lp-ray-2 { animation: rayRotate2 100s linear infinite reverse; opacity: 0.7; }
        .lp-ray-3 { animation: rayRotate1 150s linear infinite 5s; opacity: 0.45; }
        @keyframes rayRotate1  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes rayRotate2  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes raysPulse   { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.70; } }
        @keyframes raysParallax { 0% { transform: translate(-50%, -50%) scale(1); } 100% { transform: translate(-49.5%, -49.5%) scale(1.02); } }
        .lp-mist-a { animation: mistA 14s ease-in-out infinite, mistParallaxA 45s ease-in-out infinite alternate; }
        .lp-mist-b { animation: mistB 18s ease-in-out infinite 3s, mistParallaxB 45s ease-in-out infinite alternate; }
        @keyframes mistA { 0%,100% { transform:translateX(0) scaleX(1); opacity:.8 } 50% { transform:translateX(3%) scaleX(1.03); opacity:.5 } }
        @keyframes mistB { 0%,100% { transform:translateX(0) scaleX(1); opacity:.8 } 50% { transform:translateX(-4%) scaleX(1.05); opacity:.45 } }
        @keyframes mistParallaxA { 0% { transform: translate(0px, 0px); } 100% { transform: translate(-12px, 1.5px); } }
        @keyframes mistParallaxB { 0% { transform: translate(0px, 0px); } 100% { transform: translate(-15px, 0.5px); } }
        @keyframes wsSwayCustom { 0%, 100% { transform: rotate(calc(-1 * var(--sway-deg))) skewX(calc(-0.5 * var(--sway-deg))); } 50% { transform: rotate(var(--sway-deg)) skewX(calc(0.5 * var(--sway-deg))); } }
        .lp-foreground { transform-origin: bottom center; animation: foregroundParallax 45s ease-in-out infinite alternate; }
        @keyframes foregroundParallax { 0% { transform: scale(1.02) translate(0px, 0px); } 100% { transform: scale(1.02) translate(-26px, 6px); } }
        .lp-birds { animation: birdsFloat 16s ease-in-out infinite; }
        @keyframes birdsFloat { 0%,100% { transform:translateX(0) translateY(0) } 50% { transform:translateX(12px) translateY(-4px) } }
      `}</style>
    </div>
  );
}

/* ── Eye Icon ─────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ── Register Page ────────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name || !form.email || !form.phone || !form.password || !form.confirm_password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      if (res.data.success) {
        toast.success('Account created! Welcome to IGo Academy.');
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      const code = err.response?.data?.error;
      if (code === 'CONFLICT') {
        setError('An account with that email already exists. Try signing in.');
      } else {
        setError(msg);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050C03', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <LandscapePanel />
      </div>

      {/* Card */}
      <div className="lp-card-container">
        <div className="lp-form-card">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src="/igo-logo.png" alt="IGo Academy"
              style={{ height: 48, margin: '0 auto .3rem', display: 'block' }} />
            <p style={{ color: 'var(--gold-dark)', fontSize: '.68rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase' }}>
              Grow · Learn · Lead
            </p>
          </div>

          {/* Heading */}
          <h1 style={{ color: 'var(--navy-dark)', fontWeight: 800, fontSize: '1.35rem', marginBottom: '.12rem', letterSpacing: '-.02em', textAlign: 'center' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '.82rem', marginBottom: '1.1rem', textAlign: 'center' }}>
            Join IGo Academy — learn agri-entrepreneurship online
          </p>

          {/* Error */}
          {error && (
            <div className="alert-error" style={{ marginBottom: '.9rem' }}>
              &#9888; {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} noValidate>

            <div className="form-group">
              <label className="form-label" htmlFor="rp-name">Full Name</label>
              <input
                id="rp-name" type="text" className="igo-input"
                placeholder="Your full name"
                value={form.full_name} onChange={set('full_name')}
                autoComplete="name" autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rp-email">Email Address</label>
              <input
                id="rp-email" type="email" className="igo-input"
                placeholder="you@example.com"
                value={form.email} onChange={set('email')}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rp-phone">Phone Number</label>
              <input
                id="rp-phone" type="tel" className="igo-input"
                placeholder="10-digit mobile number"
                value={form.phone} onChange={set('phone')}
                autoComplete="tel"
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="rp-pw">Password</label>
              <input
                id="rp-pw"
                type={showPw ? 'text' : 'password'}
                className="igo-input" placeholder="Min 8 characters"
                value={form.password} onChange={set('password')}
                autoComplete="new-password"
                style={{ paddingRight: '3rem' }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: 'calc(50% + 10px)',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--gray-400)', display: 'flex', alignItems: 'center',
                  padding: 4, borderRadius: 6, transition: 'color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray-400)')}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="rp-confirm">Confirm Password</label>
              <input
                id="rp-confirm"
                type={showConfirm ? 'text' : 'password'}
                className="igo-input" placeholder="Re-enter your password"
                value={form.confirm_password} onChange={set('confirm_password')}
                autoComplete="new-password"
                style={{ paddingRight: '3rem' }}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: 'calc(50% + 10px)',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--gray-400)', display: 'flex', alignItems: 'center',
                  padding: 4, borderRadius: 6, transition: 'color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray-400)')}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ fontSize: '.95rem', padding: '.75rem', borderRadius: '14px', marginTop: '.3rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white',
                    borderRadius: '50%', display: 'inline-block',
                    animation: 'spin .7s linear infinite',
                  }} />
                  Creating account…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Sign-in link */}
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.83rem', color: 'var(--gray-600)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>

          {/* Footer */}
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ height: 1, flex: 1, background: 'rgba(22,64,43,0.12)' }} />
              <p style={{ color: 'var(--gray-600)', fontSize: '.7rem', whiteSpace: 'nowrap', fontWeight: 700, letterSpacing: '.08em' }}>
                TNSDC · MSME RECOGNISED
              </p>
              <div style={{ height: 1, flex: 1, background: 'rgba(22,64,43,0.12)' }} />
            </div>
            <p style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '.68rem', marginTop: '.6rem' }}>
              © IGo Academy 2026 · Chennai, Tamil Nadu
            </p>
          </div>
        </div>
      </div>

      {/* Micro-animation CSS */}
      <style>{`
        .lp-card-container {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; box-sizing: border-box;
          overflow-y: auto;
        }
        .lp-form-card {
          width: 100%; max-width: 440px;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(24px) saturate(130%);
          -webkit-backdrop-filter: blur(24px) saturate(130%);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 24px;
          padding: 1.5rem 2.25rem 1.6rem;
          box-shadow: 0 30px 60px rgba(12, 32, 20, 0.15), 0 1px 0 rgba(255, 255, 255, 0.5) inset;
          animation: lp-card-fade-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
          margin: auto;
        }
        .lp-form-card .form-group { margin-bottom: 0.85rem; }
        .lp-form-card .igo-input {
          background: rgba(255, 255, 255, 0.45) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
          color: var(--navy-dark) !important;
          -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
        }
        .lp-form-card .igo-input::placeholder { color: rgba(12, 32, 20, 0.5) !important; }
        .lp-form-card .igo-input:focus {
          background: rgba(255, 255, 255, 0.75) !important;
          border-color: var(--green) !important;
          box-shadow: 0 0 0 4px rgba(79,160,46,.15) !important;
        }
        .lp-form-card .alert-error {
          background: rgba(254, 242, 242, 0.65) !important;
          -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
        @keyframes lp-card-fade-in {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

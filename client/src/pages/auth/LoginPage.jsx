import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/* ── Birds (tiny silhouettes drifting across the sky) ───────── */
function Birds() {
  return (
    <g className="lp-birds" opacity="0.38">
      <path d="M80 38 Q84 35 88 38" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <path d="M92 34 Q95 31.5 98 34" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <path d="M220 28 Q223 25.5 226 28" stroke="rgba(255,255,255,0.7)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
    </g>
  );
}

/* ── Landscape Panel ──────────────────────────────────────────── */
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

    // Initialize particles (pollen / atmospheric dust)
    const particleCount = 55;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random(); // 0 (far background) to 1 (close foreground)
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: depth * 3.0 + 0.6,
        depth: depth,
        // wind drifts slowly to the right
        vx: (Math.random() * 0.28 + 0.08) * (depth * 0.7 + 0.3), 
        // floats slowly upward
        vy: -(Math.random() * 0.38 + 0.12) * (depth * 0.7 + 0.3), 
        baseAlpha: Math.random() * 0.4 + 0.18,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 0.015 - 0.0075)
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Sun coordinates updated to match the sun position in green_field_sunrise.png
      const sunX = width * 0.67;
      const sunY = height * 0.10;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Update physics
        p.x += p.vx + Math.sin(p.angle) * 0.12;
        p.y += p.vy;
        p.angle += p.spin;

        // Wrap around boundary bounds
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
          p.y = Math.random() * height;
        } else if (p.x < -20) {
          p.x = width + 20;
        }

        // Sunlight light scattering effect:
        // Particles glow brighter when they pass closer to the sun's position.
        const dx = p.x - sunX;
        const dy = p.y - sunY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sunRadius = width * 0.4;
        let glow = 1.0;
        if (dist < sunRadius) {
          glow = 1.0 + (1.0 - dist / sunRadius) * 3.2; 
        }

        ctx.beginPath();
        const alpha = Math.min(0.85, p.baseAlpha * glow);
        
        let fillStyle;
        if (p.depth > 0.82) {
          // Large foreground bokeh (heavily out of focus dust mote)
          fillStyle = `rgba(255, 215, 90, ${alpha * 0.14})`;
          ctx.arc(p.x, p.y, p.radius * 3.0, 0, Math.PI * 2);
        } else if (p.depth < 0.22) {
          // Tiny background particles (soft white-greenish sparkle)
          fillStyle = `rgba(230, 250, 205, ${alpha * 0.38})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        } else {
          // Crisp midground golden pollen grains
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
    <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden' }}>

      {/* ── Camera Rig wrapping the entire depth simulation ── */}
      <div className="lp-camera-rig" style={{
        position: 'absolute',
        top: '-5%', left: '-5%', right: '-5%', bottom: '-5%',
        width: '110%', height: '110%',
      }}>

        {/* Layer 1: Photorealistic Dawn Background Image (Ken Burns Animated) */}
        <div className="lp-video-bg" style={{ position:'absolute', inset:0 }}/>

        {/* Volumetric Conic God Rays centering on the top-right sun location */}
        <div className="lp-godrays" style={{
          position: 'absolute',
          top: '10%',
          left: '67%',
          transform: 'translate(-50%, -50%)',
          width: '150%',
          height: '150%',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}>
          <div className="lp-ray lp-ray-1" />
          <div className="lp-ray lp-ray-2" />
          <div className="lp-ray lp-ray-3" />
        </div>

        {/* Layer 2: Star field (twinkling and fading as morning approaches) */}
        <svg className="lp-stars" style={{ position:'absolute', top:0, left:0, width:'100%', height:'45%' }}
          viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
          {[
            [350,15],[420,8],[480,22],[540,6],[580,18],
            [370,45],[435,52],[495,38],[560,50],[590,32]
          ].map(([sx,sy],i) => (
            <circle key={i} cx={sx} cy={sy} r={Math.random()>0.5?1.0:0.6}
              fill="white" opacity={0.35+Math.random()*0.3}
              style={{ animation:`starTwinkle ${3+i%3}s ease-in-out infinite ${i*0.4}s` }}/>
          ))}
        </svg>

        {/* Layer 3: Mist layers drifting across valleys */}
        <div className="lp-mist-a" style={{
          position:'absolute', top:'25%', left:'-15%', right:'-15%', height:'18%',
          background:'linear-gradient(180deg,transparent,rgba(220,238,190,0.22),transparent)',
          filter:'blur(24px)',
          mixBlendMode: 'screen',
        }}/>
        <div className="lp-mist-b" style={{
          position:'absolute', top:'35%', left:'-8%', right:'-8%', height:'14%',
          background:'linear-gradient(180deg,transparent,rgba(200,218,170,0.18),transparent)',
          filter:'blur(30px)',
          mixBlendMode: 'screen',
        }}/>

        {/* Layer 4: HTML5 Pollen Particle Canvas Overlay */}
        <canvas ref={canvasRef} style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}/>

        {/* Layer 5: Foreground bokeh blurred wheat stalks (extreme DoF) */}
        <svg className="lp-foreground" style={{
          position: 'absolute',
          bottom: '-3%',
          left: '-3%',
          width: '106%',
          height: '24%',
          pointerEvents: 'none',
          zIndex: 10,
        }} viewBox="0 0 475 140" preserveAspectRatio="none">
          <Birds/>
          {[
            { x: 30,  h: 96,  blur: 4.2 },
            { x: 130, h: 108, blur: 5.0 },
            { x: 360, h: 102, blur: 4.5 },
            { x: 430, h: 112, blur: 5.5 }
          ].map((s, i) => {
            const gold = '#FFA520'; 
            const stem = '#724c12';
            const delay = -1.2 - (s.x * 0.015);
            const duration = 2.4 + (i % 2) * 0.35;
            return (
              <g
                key={`fg-${i}`}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center bottom',
                  animation: `wsSwayCustom ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                  '--sway-deg': '6.2deg',
                  filter: `blur(${s.blur}px)`,
                }}
                opacity="0.38"
              >
                <line x1={s.x} y1="140" x2={s.x} y2={140-s.h} stroke={stem} strokeWidth="3.8" strokeLinecap="round"/>
                <ellipse cx={s.x-7} cy={140-s.h*0.55} rx="4.5" ry="9" fill={gold} opacity="0.6" transform={`rotate(-28,${s.x-7},${140-s.h*0.55})`}/>
                <ellipse cx={s.x+7} cy={140-s.h*0.7}  rx="4.5" ry="8" fill={gold} opacity="0.6" transform={`rotate(22,${s.x+7},${140-s.h*0.7})`}/>
                <ellipse cx={s.x} cy={140-s.h-6} rx="5.5" ry="13" fill={gold} opacity="0.8"/>
              </g>
            );
          })}
        </svg>

      </div>

      <style>{`
        .lp-camera-rig {
          animation: cameraDrift 45s ease-in-out infinite alternate;
        }
        @keyframes cameraDrift {
          0% { transform: scale(1.02) translate(0px, 0px) rotate(0deg); }
          100% { transform: scale(1.08) translate(-6px, -3px) rotate(0.1deg); }
        }

        .lp-video-bg {
          background-image: url("/green_field_sunrise.png");
          background-size: cover;
          background-position: center;
          transform-origin: center;
          animation: bgParallax 45s ease-in-out infinite alternate;
        }
        @keyframes bgParallax {
          0% { 
            transform: translate(0px, 0px) scale(1); 
            filter: brightness(0.88) contrast(1.02) saturate(0.95); 
          }
          100% { 
            transform: translate(4px, -2px) scale(1.03); 
            filter: brightness(1.06) contrast(0.98) saturate(1.10); 
          }
        }

        .lp-stars { 
          animation: starsFade 24s ease-in-out infinite alternate, starsParallax 45s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes starsFade {
          0%   { opacity: 0.85 }
          100% { opacity: 0.02 }
        }
        @keyframes starTwinkle {
          0%,100% { opacity:.3 }
          50%      { opacity:.9 }
        }
        @keyframes starsParallax {
          0% { transform: translate(0px, 0px); }
          100% { transform: translate(3px, -1px); }
        }

        .lp-godrays {
          transform-origin: center;
          animation: raysPulse 14s ease-in-out infinite alternate, raysParallax 45s ease-in-out infinite alternate;
        }
        .lp-ray {
          position: absolute;
          inset: 0;
          background: conic-gradient(
            from -40deg at 50% 50%,
            transparent 0deg,
            rgba(255, 230, 160, 0.07) 15deg,
            transparent 30deg,
            transparent 95deg,
            rgba(255, 218, 120, 0.10) 115deg,
            transparent 135deg,
            transparent 210deg,
            rgba(255, 230, 160, 0.05) 225deg,
            transparent 240deg,
            transparent 310deg,
            rgba(255, 218, 120, 0.08) 328deg,
            transparent 344deg,
            transparent 360deg
          );
          border-radius: 50%;
        }
        .lp-ray-1 { animation: rayRotate1 70s linear infinite; }
        .lp-ray-2 { animation: rayRotate2 100s linear infinite reverse; opacity: 0.7; }
        .lp-ray-3 { animation: rayRotate1 150s linear infinite 5s; opacity: 0.45; }

        @keyframes rayRotate1 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rayRotate2 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes raysPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.70; }
        }
        @keyframes raysParallax {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-49.5%, -49.5%) scale(1.02); }
        }

        .lp-mist-a { animation: mistA 14s ease-in-out infinite, mistParallaxA 45s ease-in-out infinite alternate; }
        .lp-mist-b { animation: mistB 18s ease-in-out infinite 3s, mistParallaxB 45s ease-in-out infinite alternate; }
        @keyframes mistA {
          0%,100% { transform:translateX(0)   scaleX(1);    opacity:.8 }
          50%      { transform:translateX(3%)  scaleX(1.03); opacity:.5 }
        }
        @keyframes mistB {
          0%,100% { transform:translateX(0)   scaleX(1);    opacity:.8 }
          50%      { transform:translateX(-4%) scaleX(1.05); opacity:.45 }
        }
        @keyframes mistParallaxA {
          0% { transform: translate(0px, 0px); }
          100% { transform: translate(-12px, 1.5px); }
        }
        @keyframes mistParallaxB {
          0% { transform: translate(0px, 0px); }
          100% { transform: translate(-15px, 0.5px); }
        }

        @keyframes wsSwayCustom {
          0%, 100% { transform: rotate(calc(-1 * var(--sway-deg))) skewX(calc(-0.5 * var(--sway-deg))); }
          50% { transform: rotate(var(--sway-deg)) skewX(calc(0.5 * var(--sway-deg))); }
        }

        .lp-foreground {
          transform-origin: bottom center;
          animation: foregroundParallax 45s ease-in-out infinite alternate;
        }
        @keyframes foregroundParallax {
          0% { transform: scale(1.02) translate(0px, 0px); }
          100% { transform: scale(1.02) translate(-26px, 6px); }
        }

        .lp-birds { animation:birdsFloat 16s ease-in-out infinite }
        @keyframes birdsFloat {
          0%,100% { transform:translateX(0)   translateY(0) }
          50%      { transform:translateX(12px) translateY(-4px) }
        }
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

/* ── Login Page ───────────────────────────────────────────────── */
export default function LoginPage() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(
        result.error === 'COURSE_EXPIRED'    ? 'Your course access has ended. Contact IGo Academy.' :
        result.error === 'UNAUTHORIZED'      ? 'Your account has been deactivated.' :
        result.error === 'TOO_MANY_REQUESTS' ? 'Too many login attempts. Please wait a few minutes.' :
        'Invalid email or password. Please try again.'
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', background:'#050C03', overflow:'hidden' }}>

      {/* ── Background: Cinematic Landscape Video ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0 }}>
        <LandscapePanel/>
      </div>

      {/* ── Foreground: Glassmorphic Centered Login Card ── */}
      <div className="lp-card-container">
        <div className="lp-form-card">

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'1.2rem' }}>
            <div style={{ display:'inline-block', position:'relative' }}>
              <img src="/igo-logo.png" alt="IGo Academy"
                style={{ height:52, margin:'0 auto .35rem', display:'block' }}/>
            </div>
            <p style={{
              color:'var(--gold-dark)', fontSize:'.68rem', fontWeight:800,
              letterSpacing:'.22em', textTransform:'uppercase',
            }}>Grow · Learn · Lead</p>
          </div>

          {/* Heading */}
          <h1 style={{
            color:'var(--navy-dark)', fontWeight:800, fontSize:'1.4rem',
            marginBottom:'.15rem', letterSpacing:'-.02em', textAlign:'center',
          }}>
            Welcome back 👋
          </h1>
          <p style={{ color:'var(--gray-600)', fontSize:'.82rem', marginBottom:'1.25rem', textAlign:'center' }}>
            Sign in to your IGo Academy account
          </p>

          {/* Error */}
          {error && (
            <div className="alert-error" style={{ marginBottom:'1rem' }}>⚠ {error}</div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="lp-email">Email Address</label>
              <input
                id="lp-email"
                type="email" placeholder="you@igoacademy.in" className="igo-input"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ position:'relative' }}>
              <label className="form-label" htmlFor="lp-pw">Password</label>
              <input
                id="lp-pw"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                className="igo-input"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight:'3rem' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position:'absolute', right:'12px', top:'calc(50% + 10px)',
                  transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--gray-400)', display:'flex', alignItems:'center',
                  padding:4, borderRadius:6,
                  transition:'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--green)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--gray-400)'}
              >
                <EyeIcon open={showPw}/>
              </button>
            </div>

            <div style={{ textAlign:'right', marginBottom:'1.2rem', marginTop:'-.55rem' }}>
              <Link to="/forgot-password" style={{
                color:'var(--gold-dark)', fontSize:'.82rem', fontWeight:700, textDecoration:'none',
              }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ fontSize:'.95rem', padding:'.75rem', borderRadius:'14px' }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{
                    width:18, height:18,
                    border:'2.5px solid rgba(255,255,255,0.35)', borderTopColor:'white',
                    borderRadius:'50%', display:'inline-block',
                    animation:'spin .7s linear infinite',
                  }}/>
                  Signing in…
                </span>
              ) : (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider + footer */}
          <div style={{ marginTop:'1.35rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ height:1, flex:1, background:'rgba(22,64,43,0.12)' }}/>
              <p style={{ color:'var(--gray-600)', fontSize:'.7rem', whiteSpace:'nowrap', fontWeight:700, letterSpacing:'.08em' }}>
                TNSDC · MSME RECOGNISED
              </p>
              <div style={{ height:1, flex:1, background:'rgba(22,64,43,0.12)' }}/>
            </div>
            <p style={{ textAlign:'center', color:'var(--gray-600)', fontSize:'.68rem', marginTop:'.6rem' }}>
              © IGo Academy 2026 · Chennai, Tamil Nadu
            </p>
          </div>
        </div>
      </div>

      {/* Layout + micro-animation CSS */}
      <style>{`
        .lp-card-container {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }
        
        .lp-form-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(24px) saturate(130%);
          -webkit-backdrop-filter: blur(24px) saturate(130%);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 24px;
          padding: 1.65rem 2.25rem;
          box-shadow: 0 30px 60px rgba(12, 32, 20, 0.15), 
                      0 1px 0 rgba(255, 255, 255, 0.5) inset;
          animation: lp-card-fade-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Spacing override for shortened vertical flow */
        .lp-form-card .form-group {
          margin-bottom: 0.95rem;
        }

        /* Glassmorphic inputs for high integration */
        .lp-form-card .igo-input {
          background: rgba(255, 255, 255, 0.45) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
          color: var(--navy-dark) !important;
          backdrop-filter: blur(4px);
        }
        .lp-form-card .igo-input::placeholder {
          color: rgba(12, 32, 20, 0.5) !important;
        }
        .lp-form-card .igo-input:focus {
          background: rgba(255, 255, 255, 0.75) !important;
          border-color: var(--green) !important;
          box-shadow: 0 0 0 4px rgba(79,160,46,.15) !important;
        }

        /* Glassmorphic error alert */
        .lp-form-card .alert-error {
          background: rgba(254, 242, 242, 0.65) !important;
          backdrop-filter: blur(8px);
          border-color: rgba(239, 68, 68, 0.3) !important;
        }

        @keyframes lp-card-fade-in {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
          background-image: url("/green_field_sunrise.webp");
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
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/student/dashboard';
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // Registration is gated on phone verification: fill the form ('form' step)
  // -> OTP sent to the phone -> enter it ('otp' step) -> account is only
  // actually created once that OTP verifies.
  const [step, setStep]           = useState('form');
  const OTP_LEN = 6;
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LEN).fill(''));
  const otp = otpDigits.join('');
  const otpRefs = useRef([]);
  const [resendIn, setResendIn]   = useState(0);
  // 'entering' -> typing the code | 'verifying' -> API call in flight
  // -> 'success' -> checkmark celebration, then navigate away.
  const [verifyStage, setVerifyStage] = useState('entering');

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateForm = () => {
    if (!form.full_name || !form.email || !form.phone || !form.password || !form.confirm_password) {
      setError('Please fill in all fields.');
      return false;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/send-otp', { email: form.email, phone: form.phone });
      toast.success('OTP sent to your phone.');
      setStep('otp');
      setResendIn(30);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not send OTP. Please try again.';
      const code = err.response?.data?.error;
      setError(code === 'CONFLICT' ? `${msg} Try signing in.` : msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSendOtp = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    sendOtp();
  };

  const onResendOtp = () => {
    if (resendIn > 0 || loading) return;
    setOtpDigits(Array(OTP_LEN).fill(''));
    setVerifyStage('entering');
    otpRefs.current[0]?.focus();
    sendOtp();
  };

  const resetOtpBoxes = () => {
    setOtpDigits(Array(OTP_LEN).fill(''));
    setVerifyStage('entering');
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  };

  // Boxes scatter outward, tumble, then converge back to a point over this
  // long -- held to at least this length even if the API responds faster,
  // so the animation always plays out in full instead of getting cut off.
  const VERIFY_ANIM_MS = 1450;

  const submitVerify = async (fullOtp) => {
    setError('');
    setVerifyStage('verifying');
    setLoading(true);
    try {
      const minDelay = new Promise((r) => setTimeout(r, VERIFY_ANIM_MS));
      const [res] = await Promise.all([
        api.post('/auth/register', {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          agreed_to_terms: agreedToTerms,
          otp: fullOtp,
        }),
        minDelay,
      ]);

      if (res.data.success) {
        setVerifyStage('success');
        // Let the checkmark celebration play before leaving the page.
        setTimeout(() => navigate(redirectPath), 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      const code = err.response?.data?.error;
      setError(code === 'CONFLICT' ? 'An account with that email or phone already exists. Try signing in.' : msg);
      toast.error(msg);
      resetOtpBoxes();
    } finally {
      setLoading(false);
    }
  };

  const onVerifyAndCreate = (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LEN) {
      setError(`Enter the ${OTP_LEN}-digit OTP sent to your phone.`);
      return;
    }
    submitVerify(otp);
  };

  // Auto-verify the moment the last digit lands — matches how SMS
  // autofill/paste behaves on mobile, no extra tap needed.
  useEffect(() => {
    if (otp.length === OTP_LEN && verifyStage === 'entering' && !loading) {
      submitVerify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const fillFrom = (index, chars) => {
    setOtpDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < chars.length && index + i < OTP_LEN; i++) next[index + i] = chars[i];
      return next;
    });
    const lastFilled = Math.min(index + chars.length - 1, OTP_LEN - 1);
    otpRefs.current[Math.min(lastFilled + 1, OTP_LEN - 1)]?.focus();
  };

  const handleOtpChange = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, '');
    // A single keystroke arrives as one character -- normal typing path,
    // unchanged. Anything longer is SMS autofill (Chrome/Android can drop
    // the whole code into whichever box is focused, via the
    // autoComplete="one-time-code" hint below) or a keyboard-suggestion
    // paste -- distribute it across the remaining boxes instead of
    // discarding everything but the last character.
    if (digits.length > 1) {
      fillFrom(index, digits.slice(0, OTP_LEN - index));
      return;
    }
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digits;
      return next;
    });
    if (digits && index < OTP_LEN - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
    if (!pasted) return;
    e.preventDefault();
    fillFrom(0, pasted);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050C03', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <LandscapePanel />
      </div>

      {/* ── Top-left home navigation ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:20, padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display:'flex', alignItems:'center', gap:10,
            background:'rgba(255,255,255,0.1)', backdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:50, padding:'.45rem 1rem .45rem .6rem',
            cursor:'pointer', transition:'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; }}
        >
          <img src="/igo-logo.webp" alt="IGO" style={{ height:26, display:'block' }}
            onError={e => { e.target.style.display='none'; }} />
          <span style={{ color:'white', fontSize:'.78rem', fontWeight:700 }}>IGO Academy</span>
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            color:'rgba(255,255,255,0.65)', fontSize:'.78rem', fontWeight:600,
            background:'none', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', gap:5,
          }}
        >
          ← Home
        </button>
      </div>

      {/* Card */}
      <div className="lp-card-container">
        <div className="lp-form-card">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src="/igo-logo.webp" alt="IGo Academy"
              style={{ height: 48, margin: '0 auto .3rem', display: 'block' }} />
            <p style={{ color: 'var(--gold-dark)', fontSize: '.68rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase' }}>
              Together We Grow, Together We Achieve
            </p>
          </div>

          {/* Heading */}
          <h1 style={{ color: 'var(--navy-dark)', fontWeight: 800, fontSize: '1.35rem', marginBottom: '.12rem', letterSpacing: '-.02em', textAlign: 'center' }}>
            {step === 'form' ? 'Create your account'
              : verifyStage === 'success' ? 'Verified successfully'
              : "Let's verify your number"}
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '.82rem', marginBottom: '1.1rem', textAlign: 'center' }}>
            {step === 'form'
              ? 'Join IGo Academy — learn agri-entrepreneurship online'
              : verifyStage === 'success'
              ? 'Your phone number has been verified.'
              : <>We've sent a {OTP_LEN}-digit code to <strong>{form.phone}</strong>. It'll auto-verify once entered.</>}
          </p>

          {/* Error */}
          {error && verifyStage !== 'success' && (
            <div className="alert-error" style={{ marginBottom: '.9rem' }}>
              &#9888; {error}
            </div>
          )}

          {step === 'otp' ? (
            verifyStage === 'success' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0 .5rem', position: 'relative' }}>
                <span className="rp-otp-ripple rp-otp-ripple-1" />
                <span className="rp-otp-ripple rp-otp-ripple-2" />
                <div className="rp-otp-check-badge">
                  <svg width="34" height="34" viewBox="0 0 34 34">
                    <path d="M9 17.5 L14.5 23 L25 10" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="rp-otp-check-mark" />
                  </svg>
                </div>
                <p style={{ marginTop: '1.1rem', fontWeight: 800, color: 'var(--green)', fontSize: '.85rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  🔒 Verified &amp; Secured
                </p>
              </div>
            ) : (
            <form onSubmit={onVerifyAndCreate} noValidate>
              <div className="form-group" onPaste={handleOtpPaste}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>{OTP_LEN}-Digit OTP</label>
                <div className={`rp-otp-boxes${verifyStage === 'verifying' ? ' rp-otp-boxes-verifying' : ''}`}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      className="rp-otp-box"
                      style={{ animationDelay: digit ? `${i * 70}ms` : undefined }}
                      value={digit}
                      disabled={verifyStage === 'verifying'}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      data-filled={digit ? 'true' : 'false'}
                      autoFocus={i === 0}
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading || otp.length !== OTP_LEN}
                style={{ fontSize: '.95rem', padding: '.75rem', borderRadius: '14px', marginTop: '.3rem' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 18, height: 18,
                      border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white',
                      borderRadius: '50%', display: 'inline-block',
                      animation: 'spin .7s linear infinite',
                    }} />
                    Verifying…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Verify &amp; Create Account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.9rem' }}>
                <button type="button" onClick={() => { setStep('form'); resetOtpBoxes(); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--gray-600)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  ← Edit details
                </button>
                <button type="button" onClick={onResendOtp} disabled={resendIn > 0 || loading}
                  style={{
                    background: 'none', border: 'none', fontSize: '.8rem', fontWeight: 700, padding: 0,
                    color: resendIn > 0 ? 'var(--gray-400)' : 'var(--gold-dark)',
                    cursor: resendIn > 0 ? 'default' : 'pointer',
                  }}>
                  {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
            )
          ) : (
          <form onSubmit={onSendOtp} noValidate>

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

            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              margin: '.2rem 0 .9rem', fontSize: '.78rem', color: 'var(--gray-600)',
              cursor: 'pointer', lineHeight: 1.4,
            }}>
              <input
                type="checkbox" checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0, cursor: 'pointer', accentColor: 'var(--green)' }}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-dark)', fontWeight: 700, textDecoration: 'none' }}>
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-dark)', fontWeight: 700, textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </span>
            </label>

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
                  Sending OTP…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Send OTP
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </button>
          </form>
          )}

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

        /* ── OTP boxes ─────────────────────────────────────────── */
        .rp-otp-boxes {
          display: flex; justify-content: center; gap: .55rem; margin-top: .3rem;
        }
        .rp-otp-box {
          width: 44px; height: 52px; text-align: center;
          font-size: 1.25rem; font-weight: 800; color: var(--navy-dark);
          background: rgba(255,255,255,0.55);
          border: 1.5px solid rgba(0,0,0,0.12); border-radius: 12px;
          outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .rp-otp-box:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 4px rgba(79,160,46,.15);
          animation: rpOtpGlow 1.4s ease-in-out infinite;
        }
        /* Digit "flies" up into the box and settles, instead of appearing instantly. */
        .rp-otp-box[data-filled="true"] {
          animation: rpOtpFlyIn .38s cubic-bezier(.34,1.56,.64,1) both;
          border-color: var(--gold);
        }
        @keyframes rpOtpFlyIn {
          0%   { transform: translateY(-22px) scale(.5); opacity: 0; }
          65%  { transform: translateY(3px) scale(1.12); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes rpOtpGlow {
          0%, 100% { box-shadow: 0 0 0 4px rgba(79,160,46,.15); }
          50%      { box-shadow: 0 0 0 7px rgba(79,160,46,.06); }
        }
        /* Once all boxes are filled, the whole row lifts off together and
           orbits as ONE rigid formation around a shared center point — each
           box holds its own slot on the circle and they all sweep around
           together (not each box flying off on its own, independent path,
           which read as "splitting apart" rather than a unified loop) —
           then the formation spirals inward and collapses onto that center
           point right as the success badge takes over. Each box gets its
           own @keyframes (rpOrbit0..5) because the exact px path differs
           per slot, but all six share the same timing/duration so they move
           as a single group, and the border/glow colour is one shared
           animation (rpOtpOrbitGlow) layered on top of every box alike. */
        .rp-otp-boxes-verifying .rp-otp-box {
          animation-duration: 1450ms, 1450ms;
          animation-timing-function: ease-in-out, cubic-bezier(.5,.05,.5,.95);
          animation-fill-mode: forwards, forwards;
          pointer-events: none;
        }
        .rp-otp-boxes-verifying .rp-otp-box:nth-child(1) { animation-name: rpOtpOrbitGlow, rpOrbit0; }
        .rp-otp-boxes-verifying .rp-otp-box:nth-child(2) { animation-name: rpOtpOrbitGlow, rpOrbit1; }
        .rp-otp-boxes-verifying .rp-otp-box:nth-child(3) { animation-name: rpOtpOrbitGlow, rpOrbit2; }
        .rp-otp-boxes-verifying .rp-otp-box:nth-child(4) { animation-name: rpOtpOrbitGlow, rpOrbit3; }
        .rp-otp-boxes-verifying .rp-otp-box:nth-child(5) { animation-name: rpOtpOrbitGlow, rpOrbit4; }
        .rp-otp-boxes-verifying .rp-otp-box:nth-child(6) { animation-name: rpOtpOrbitGlow, rpOrbit5; }

        @keyframes rpOtpOrbitGlow {
          0%   { border-color: var(--gold); box-shadow: 0 0 0 0 transparent; }
          16%  { border-color: var(--gold); box-shadow: 0 0 14px 1px var(--gold); }
          42%  { border-color: var(--gold); box-shadow: 0 0 16px 1px var(--gold); }
          66%  { border-color: var(--green); box-shadow: 0 0 14px 1px var(--green); }
          84%  { border-color: var(--green); box-shadow: 0 0 10px 0 var(--green); }
          100% { border-color: var(--green); box-shadow: 0 0 0 0 transparent; }
        }

        /* Six evenly-spaced slots (60deg apart) around a shared circle at
           the row's centre, radius 60px. That radius (and the shrink to
           ~0.6 scale the moment the boxes leave the row) is the fix for a
           real bug in the first version: at a small radius with boxes
           still at full/110% size, six 44px-wide boxes 60deg apart simply
           don't fit — they piled on top of each other in a jumbled overlap
           instead of tracing a visible ring. Verified by computing the
           minimum pairwise distance between box centres at every stop and
           checking it against the box's diagonal at that scale: needs to
           stay comfortably clear through the orbit (16%-66%) and is only
           expected to close up again during the final convergence
           (84%-100%, where overlapping IS the point — they're merging).
           Each box: 0% sits in its normal row position → 16% snaps onto
           its circle slot, already shrunk → 42%/66% the whole ring sweeps
           around together (same 0deg->540deg rotation, just offset by each
           box's own starting slot) → 84%/100% spirals back in and vanishes
           at the centre, scale 0 / opacity 0, exactly as verifyStage flips
           to 'success'. Numbers are pre-computed (not runtime trig) so the
           path is identical every time and easy to check against a video
           frame-by-frame. */
        @keyframes rpOrbit0 {
          0%   { transform: translate(0.0px, 0.0px) rotate(0deg) scale(1); opacity: 1; }
          16%  { transform: translate(72.0px, -0.0px) rotate(180deg) scale(0.6); opacity: 1; }
          42%  { transform: translate(188.4px, -20.5px) rotate(380deg) scale(0.58); opacity: 1; }
          66%  { transform: translate(102.0px, 52.0px) rotate(600deg) scale(0.58); opacity: 1; }
          84%  { transform: translate(145.5px, 16.1px) rotate(670deg) scale(0.32); opacity: 0.8; }
          100% { transform: translate(132.0px, 0.0px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes rpOrbit1 {
          0%   { transform: translate(0.0px, 0.0px) rotate(0deg) scale(1); opacity: 1; }
          16%  { transform: translate(49.2px, -52.0px) rotate(120deg) scale(0.6); opacity: 1; }
          42%  { transform: translate(125.2px, 38.6px) rotate(320deg) scale(0.58); opacity: 1; }
          66%  { transform: translate(19.2px, -0.0px) rotate(540deg) scale(0.58); opacity: 1; }
          84%  { transform: translate(72.0px, 19.7px) rotate(610deg) scale(0.32); opacity: 0.8; }
          100% { transform: translate(79.2px, 0.0px) rotate(660deg) scale(0); opacity: 0; }
        }
        @keyframes rpOrbit2 {
          0%   { transform: translate(0.0px, 0.0px) rotate(0deg) scale(1); opacity: 1; }
          16%  { transform: translate(56.4px, -52.0px) rotate(60deg) scale(0.6); opacity: 1; }
          42%  { transform: translate(16.0px, 59.1px) rotate(260deg) scale(0.58); opacity: 1; }
          66%  { transform: translate(-3.6px, -52.0px) rotate(480deg) scale(0.58); opacity: 1; }
          84%  { transform: translate(5.7px, 3.6px) rotate(550deg) scale(0.32); opacity: 0.8; }
          100% { transform: translate(26.4px, 0.0px) rotate(600deg) scale(0); opacity: 0; }
        }
        @keyframes rpOrbit3 {
          0%   { transform: translate(0.0px, 0.0px) rotate(0deg) scale(1); opacity: 1; }
          16%  { transform: translate(33.6px, 0.0px) rotate(0deg) scale(0.6); opacity: 1; }
          42%  { transform: translate(-82.8px, 20.5px) rotate(200deg) scale(0.58); opacity: 1; }
          66%  { transform: translate(3.6px, -52.0px) rotate(420deg) scale(0.58); opacity: 1; }
          84%  { transform: translate(-39.9px, -16.1px) rotate(490deg) scale(0.32); opacity: 0.8; }
          100% { transform: translate(-26.4px, 0.0px) rotate(540deg) scale(0); opacity: 0; }
        }
        @keyframes rpOrbit4 {
          0%   { transform: translate(0.0px, 0.0px) rotate(0deg) scale(1); opacity: 1; }
          16%  { transform: translate(-49.2px, 52.0px) rotate(-60deg) scale(0.6); opacity: 1; }
          42%  { transform: translate(-125.2px, -38.6px) rotate(140deg) scale(0.58); opacity: 1; }
          66%  { transform: translate(-19.2px, 0.0px) rotate(360deg) scale(0.58); opacity: 1; }
          84%  { transform: translate(-72.0px, -19.7px) rotate(430deg) scale(0.32); opacity: 0.8; }
          100% { transform: translate(-79.2px, 0.0px) rotate(480deg) scale(0); opacity: 0; }
        }
        @keyframes rpOrbit5 {
          0%   { transform: translate(0.0px, 0.0px) rotate(0deg) scale(1); opacity: 1; }
          16%  { transform: translate(-162.0px, 52.0px) rotate(-120deg) scale(0.6); opacity: 1; }
          42%  { transform: translate(-121.6px, -59.1px) rotate(80deg) scale(0.58); opacity: 1; }
          66%  { transform: translate(-102.0px, 52.0px) rotate(300deg) scale(0.58); opacity: 1; }
          84%  { transform: translate(-111.3px, -3.6px) rotate(370deg) scale(0.32); opacity: 0.8; }
          100% { transform: translate(-132.0px, 0.0px) rotate(420deg) scale(0); opacity: 0; }
        }

        /* ── Success badge ─────────────────────────────────────── */
        .rp-otp-check-badge {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, var(--green), var(--gold-dark));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(12,32,20,.18);
          position: relative; z-index: 1;
          animation: rpBadgePop .45s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes rpBadgePop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .rp-otp-check-mark {
          stroke-dasharray: 32; stroke-dashoffset: 32;
          animation: rpCheckDraw .3s ease-out .3s forwards;
        }
        @keyframes rpCheckDraw { to { stroke-dashoffset: 0; } }

        /* Expanding rings behind the badge, echoing the reference video's
           radial glow on success — sized/positioned off the badge itself
           so they stay centred regardless of the surrounding layout. */
        .rp-otp-ripple {
          position: absolute; top: 1.25rem; left: 50%;
          width: 64px; height: 64px; margin-left: -32px;
          border-radius: 50%; border: 2px solid var(--green);
          opacity: 0; pointer-events: none;
          animation: rpRipple 1.1s ease-out both;
        }
        .rp-otp-ripple-1 { animation-delay: .05s; }
        .rp-otp-ripple-2 { animation-delay: .3s; border-color: var(--gold); }
        @keyframes rpRipple {
          0%   { transform: scale(.6); opacity: .55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

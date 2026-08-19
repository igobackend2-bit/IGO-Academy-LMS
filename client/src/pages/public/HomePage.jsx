/**
 * HomePage — Public landing page for IGO Academy
 * Revamped 2026-06-26: wheat hero, brands ecosystem strip, improved UI/UX
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Sprout, Cpu, TrendingUp, ShoppingBag, Recycle, Coffee, GraduationCap,
  ArrowRight, CheckCircle, Award, Users, MapPin, Briefcase, Rocket, Wifi,
  Leaf, Fish, Layers, Sun, PawPrint, Building2,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import MobileStickyBar from '@/components/layout/MobileStickyBar';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import SEO from '@/components/common/SEO';
import api from '@/services/api';
import { ORGANIZATION_SCHEMA, HOME_FAQS, buildFaqSchema } from '@/constants/schema';

/* ── All 26 IGO Group brands for the homepage ticker ──────────────── */
const ALL_BRANDS = [
  { name: 'IGO Agritech Farms',             color: '#2d6a14', icon: '🌾', logo: '/brand/8.jpg',  div: 'Agriculture' },
  { name: 'Farmers Factory',                 color: '#2d6a14', icon: '🏭', logo: '/brand/20.jpg', div: 'Agriculture' },
  { name: 'Valluvam',                         color: '#2d6a14', icon: '🌿', logo: '/brand/7.jpg',  div: 'Agriculture' },
  { name: 'IGO Agrimart',                    color: '#2d6a14', icon: '🛒', logo: '/brand/6.jpg',  div: 'Agriculture' },
  { name: 'IGO Nursery',                     color: '#2d6a14', icon: '🌱', logo: '/brand/14.jpg', div: 'Agriculture' },
  { name: 'IGO Crop Care',                   color: '#2d6a14', icon: '🌾', logo: '/brand/21.jpg', div: 'Agriculture' },
  { name: 'IGO Farm Factories',              color: '#2d6a14', icon: '🏗️', logo: '/brand/19.jpg', div: 'Agriculture' },
  { name: 'IGO Farm Land Estates',           color: '#2d6a14', icon: '🏡', logo: '/brand/3.jpg',  div: 'Agriculture' },
  { name: 'IGO Farm Automation',             color: '#1d4ed8', icon: '🤖', logo: '/brand/2.jpg',  div: 'Technology' },
  { name: 'Tech Farming Expert',             color: '#1d4ed8', icon: '💡', logo: '/brand/9.jpg',  div: 'Technology' },
  { name: 'IGO Tech Farming Scientists',     color: '#1d4ed8', icon: '🔬', logo: '/brand/23.jpg', div: 'Technology' },
  { name: 'IGO Fintech',                     color: '#b45309', icon: '💳', logo: '/brand/17.jpg', div: 'Finance' },
  { name: 'Farm Loans & Grants',             color: '#b45309', icon: '💰', logo: '/brand/16.jpg', div: 'Finance' },
  { name: 'Tech Farming Wealth Management',  color: '#b45309', icon: '📈', logo: '/brand/25.jpg', div: 'Finance' },
  { name: 'IGO Exports',                     color: '#6d28d9', icon: '🌍', logo: '/brand/11.jpg', div: 'Market' },
  { name: 'IGO Mart',                        color: '#6d28d9', icon: '🏪', logo: '/brand/15.jpg', div: 'Market' },
  { name: 'IGO Franchise',                   color: '#6d28d9', icon: '🤝', logo: '/brand/18.jpg', div: 'Market' },
  { name: 'IGO Farmgate Buyback',            color: '#6d28d9', icon: '♻️', logo: '/brand/24.jpg', div: 'Market' },
  { name: 'IGO Organic Pharmacy',            color: '#0e7490', icon: '💊', logo: '/brand/22.jpg', div: 'Sustainability' },
  { name: 'IGO Natural Cosmetics',           color: '#0e7490', icon: '🌸', logo: '/brand/4.jpg',  div: 'Sustainability' },
  { name: 'IGO Green Energy',                color: '#0e7490', icon: '☀️', logo: '/brand/26.jpg', div: 'Sustainability' },
  { name: 'India Green',                     color: '#0e7490', icon: '🌍', logo: '/brand/27.jpg', div: 'Sustainability' },
  { name: 'India Green Organics',            color: '#0e7490', icon: '🥦', logo: '/brand/1.jpg',  div: 'Sustainability' },
  { name: 'Palm Cafe',                       color: '#be123c', icon: '☕', logo: '/brand/12.jpg', div: 'Consumer' },
  { name: 'Protein Cuts',                    color: '#be123c', icon: '🥩', logo: '/brand/10.jpg', div: 'Consumer' },
  { name: 'IGO Academy',                     color: '#C5A03F', icon: '🎓', logo: '/brand/13.jpg', div: 'Education' },
];
const BRANDS_ROW1 = ALL_BRANDS.slice(0, 13);
const BRANDS_ROW2 = ALL_BRANDS.slice(13);

/* ── Category data — matches IGO Academy actual course catalog ──────── */
const CATEGORIES = [
  {
    Icon: Layers,    name: 'Polyhouse & Hydroponics',
    desc: 'Protected cultivation, hydroponic systems & vertical growing',
    color: '#4ade80', grad: 'linear-gradient(135deg,rgba(5,46,16,0.82) 0%,rgba(22,101,52,0.75) 100%)', light: '#dcfce7', tag: '#16a34a',
    img: '/domain/polyhouse.jpg',
  },
  {
    Icon: Sun,       name: 'Open Field & Precision Farming',
    desc: 'Scientific crop production & modern precision agriculture',
    color: '#fbbf24', grad: 'linear-gradient(135deg,rgba(61,28,0,0.80) 0%,rgba(180,83,9,0.72) 100%)', light: '#fef3c7', tag: '#d97706',
    img: '/domain/open-field.jpg',
  },
  {
    Icon: Fish,      name: 'Aquatic Farming',
    desc: 'Mud crab, fish culture & aquaculture management',
    color: '#22d3ee', grad: 'linear-gradient(135deg,rgba(4,47,46,0.82) 0%,rgba(14,116,144,0.75) 100%)', light: '#e0f7fa', tag: '#0891b2',
    img: '/domain/aquaculture.jpg',
  },
  {
    Icon: PawPrint,  name: 'Livestock & Animal Husbandry',
    desc: 'Goat farming, breed selection & livestock management',
    color: '#fb923c', grad: 'linear-gradient(135deg,rgba(61,18,0,0.80) 0%,rgba(194,65,12,0.72) 100%)', light: '#ffedd5', tag: '#ea580c',
    img: '/domain/livestock.jpg',
  },
  {
    Icon: Sprout,    name: 'Microgreens',
    desc: 'Mushroom cultivation, microgreens & nursery management',
    color: '#a78bfa', grad: 'linear-gradient(135deg,rgba(30,0,80,0.82) 0%,rgba(109,40,217,0.75) 100%)', light: '#ede9fe', tag: '#7c3aed',
    img: '/domain/specialty-crops.jpg',
  },
  {
    Icon: Building2, name: 'Urban & Rooftop Farming',
    desc: 'Terrace gardens, vertical farming & sustainable urban agri',
    color: '#60a5fa', grad: 'linear-gradient(135deg,rgba(10,22,64,0.82) 0%,rgba(29,78,216,0.75) 100%)', light: '#dbeafe', tag: '#2563eb',
    img: '/domain/urban-rooftop.jpg',
  },
];

/* ── Why cards ─────────────────────────────────────────────────────── */
const WHY = [
  {
    icon:  <Award size={24} strokeWidth={1.5} />,
    title: 'TNSDC + MSME Recognised',
    text:  'Certifications accepted by Tamil Nadu Skill Development Corporation and MSME — adds real weight to your resume.',
    color: '#2d6a14',
    light: '#e8f5e8',
  },
  {
    icon:  <Users size={24} strokeWidth={1.5} />,
    title: 'Industry Expert Faculty',
    text:  'Learn from active agri-practitioners and entrepreneurs who have built successful businesses across Tamil Nadu.',
    color: '#1d4ed8',
    light: '#dbeafe',
  },
  {
    icon:  <CheckCircle size={24} strokeWidth={1.5} />,
    title: 'Certificate on Completion',
    text:  'Pass the assessment with 70%+ and instantly download your QR-verified digital certificate.',
    color: '#b45309',
    light: '#fef3c7',
  },
];

/* ════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();

  const { data: upcomingBatches = [] } = useQuery({
    queryKey: ['upcoming-batches'],
    queryFn: () => api.get('/batches/public/upcoming').then(r => r.data.data || []),
    staleTime: 5 * 60 * 1000,
  });

  /* ── Keep the background + frame hero videos in perfect sync ────────
     Both <video> elements play the same file but load at different
     speeds, so each would otherwise start (and loop) on its own clock.
     The frame video is the master; the background follows it. */
  const bgVideoRef = useRef(null);
  const frameVideoRef = useRef(null);

  useEffect(() => {
    const master = frameVideoRef.current;
    const slave = bgVideoRef.current;
    if (!master || !slave) return;

    let started = false;

    const startTogether = () => {
      if (started) return;
      // wait until BOTH can play through without stalling
      if (master.readyState < 3 || slave.readyState < 3) return;
      started = true;
      master.currentTime = 0;
      slave.currentTime = 0;
      Promise.all([master.play(), slave.play()]).catch(() => {});
    };

    // re-align the background whenever it drifts >0.15s from the master
    const resync = setInterval(() => {
      if (!started) { startTogether(); return; }
      if (master.paused || slave.paused) return;
      const drift = Math.abs(master.currentTime - slave.currentTime);
      if (drift > 0.15) slave.currentTime = master.currentTime;
    }, 400);

    master.addEventListener('canplaythrough', startTogether);
    slave.addEventListener('canplaythrough', startTogether);
    startTogether(); // in case both are already cached

    return () => {
      clearInterval(resync);
      master.removeEventListener('canplaythrough', startTogether);
      slave.removeEventListener('canplaythrough', startTogether);
    };
  }, []);

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif" }}>

      <SEO
        title="IGO Academy — India's Tech Farming Education Platform"
        description="Government-recognised agri-skill certification (TNSDC + MSME) for students, farmers & entrepreneurs — from the education arm of the IGO Group, PAN India."
        path="/"
        jsonLd={[ORGANIZATION_SCHEMA, buildFaqSchema(HOME_FAQS)]}
      />

      <PublicNav />

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO  (premium revamp: orbs, grid, preview card)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Hero-only keyframes + global utility */}
        <style>{`
          @keyframes heroOrb { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.08) translate(2%,2%)} }
          @keyframes heroBlink { 0%,100%{opacity:1;box-shadow:0 0 8px #C5A03F,0 0 18px rgba(197,160,63,.45)} 50%{opacity:.45;box-shadow:0 0 4px #C5A03F} }
          @keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes heroFloat2 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-6px) translateX(4px)} }
          @keyframes heroScrollDot { 0%{transform:translateY(0);opacity:1} 80%{transform:translateY(11px);opacity:0} 100%{transform:translateY(0);opacity:0} }
          @keyframes heroFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          .eco-scroll::-webkit-scrollbar { display: none; }
          .eco-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes tickerLeft  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          @keyframes tickerRight { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        `}</style>

        {/* Background: video over fallback image */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Fallback image — behind video */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: "url('/wheat_field_sunrise.png')",
            backgroundSize: 'cover', backgroundPosition: 'center 40%',
          }} />

          {/* Video — on top of fallback */}
          <video
            ref={bgVideoRef}
            autoPlay loop muted playsInline preload="auto"
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          >
            <source src="/homepage-video-compressed.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Primary dark overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(110deg, rgba(12,32,20,0.97) 0%, rgba(12,32,20,0.88) 42%, rgba(12,32,20,0.52) 68%, rgba(12,32,20,0.18) 100%)',
        }} />

        {/* Ambient orb — gold (top-left) */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-8%', zIndex: 1,
          width: '55%', height: '80%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(218,165,32,0.11) 0%, transparent 65%)',
          animation: 'heroOrb 12s ease-in-out infinite', pointerEvents: 'none',
        }} />

        {/* Ambient orb — green (bottom-right) */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '10%', zIndex: 1,
          width: '42%', height: '62%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(45,106,20,0.19) 0%, transparent 65%)',
          animation: 'heroOrb 16s ease-in-out 2s infinite reverse', pointerEvents: 'none',
        }} />

        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        {/* Animated golden dust particles */}
        <HeroCanvas />

        {/* Sun rays from right side of image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="lp-ray lp-ray-1" style={{ left: '74%', opacity: .22 }} />
          <div className="lp-ray lp-ray-2" style={{ left: '80%', opacity: .14 }} />
          <div className="lp-ray lp-ray-3" style={{ left: '70%', opacity: .18 }} />
        </div>

        {/* Breathing vignette pulse (subtle warm glow) */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 75% 40%, rgba(218,165,32,0.07) 0%, transparent 70%)',
          animation: 'heroOrb 8s ease-in-out infinite',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 1220, margin: '0 auto',
          padding: '5rem 2rem 5rem',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', gap: '3rem',
        }}>

          {/* ── LEFT: Text ── */}
          <div style={{ flex: '1 1 480px', maxWidth: 640, animation: 'heroFadeUp .8s ease both' }}>

            {/* Live pulsing badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.55rem',
              background: 'rgba(197,160,63,0.09)', border: '1px solid rgba(197,160,63,0.28)',
              borderRadius: 50, padding: '6px 18px 6px 10px', marginBottom: '2rem',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C5A03F', flexShrink: 0, animation: 'heroBlink 2.5s ease-in-out infinite' }} />
              <span style={{ color: '#C5A03F', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em' }}>
                TNSDC + MSME Recognised Platform
              </span>
            </div>

            {/* Headline — gradient gold text */}
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
              fontWeight: 900, color: 'white', lineHeight: 1.02,
              marginBottom: '1.75rem', letterSpacing: '-.03em',
            }}>
              Build Your Career in{' '}
              <span style={{
                color: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #F5D060 0%, #DAA520 55%, #C5A03F 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                fontStyle: 'italic',
              }}>Modern Agriculture</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.05rem', color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 500, fontWeight: 300,
            }}>
              Practical, industry-focused training in Protected Cultivation, Hydroponics, Vertical Farming,
              Microgreens, Mushroom Farming, Open Cultivation and Agri-Business — from the education arm of the{' '}
              <strong style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>IGO Group</strong>,
              PAN India.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <button
                onClick={() => navigate('/courses')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'linear-gradient(135deg, #DAA520, #C5A03F)',
                  color: 'white', padding: '.9rem 2.25rem', borderRadius: 50,
                  fontWeight: 800, fontSize: '.9rem', border: 'none', cursor: 'pointer',
                  letterSpacing: '.04em', transition: 'all .2s',
                  boxShadow: '0 8px 32px rgba(218,165,32,.40)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(218,165,32,.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(218,165,32,.40)'; }}
              >
                Explore Courses <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/contact')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  color: 'white', padding: '.9rem 1.85rem', borderRadius: 50,
                  fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              >
                Enquire Now
              </button>
            </div>

            {/* Stats row — divided */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem' }}>
              {[
                { num: '26+',   label: 'IGO Brands' },
                { num: 'TNSDC', label: 'Approved' },
                { num: 'MSME',  label: 'Certified' },
                { num: 'PAN',   label: 'India' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, paddingLeft: i > 0 ? '1.5rem' : 0,
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <div style={{ fontSize: 'clamp(1.3rem,2.2vw,1.85rem)', fontWeight: 900, color: 'white', lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
                    {s.num}
                  </div>
                  <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: '.3rem' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Platform preview card (desktop only) ── */}
          <div className="public-nav-links" style={{ flexShrink: 0, position: 'relative', animation: 'heroFadeUp .8s ease .2s both' }}>

            {/* Cinematic Video Frame (Video 2) */}
            <div style={{
              width: 380,
              background: 'rgba(6,18,10,0.85)', backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(218,165,32,0.25)', // gold border
              borderRadius: 24, padding: '10px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.60), 0 0 30px rgba(124,191,52,0.15)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Glass shimmer top border */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent 0%, #DAA520 50%, transparent 100%)',
                borderRadius: '24px 24px 0 0',
              }} />

              {/* Story Video Player */}
              <video
                ref={frameVideoRef}
                autoPlay
                loop
                muted
                playsInline
                poster="/green_field_sunrise.png"
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: 16,
                  objectFit: 'cover',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'block',
                }}
              >
                <source src="/homepage-video-compressed.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Floating badge — TNSDC (top-left) */}
            <div style={{
              position: 'absolute', top: -18, left: -22,
              background: 'rgba(10,24,16,0.92)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,191,52,0.32)', borderRadius: 50,
              padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 8px 20px rgba(0,0,0,0.32)',
              animation: 'heroFloat 5s ease-in-out infinite',
            }}>
              <Award size={12} color="#7CBF34" strokeWidth={2} />
              <span style={{ color: 'white', fontSize: '.63rem', fontWeight: 700 }}>TNSDC Approved</span>
            </div>

            {/* Floating badge — PAN India (bottom-right) */}
            <div style={{
              position: 'absolute', bottom: -16, right: -28,
              background: 'rgba(10,24,16,0.92)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(218,165,32,0.32)', borderRadius: 50,
              padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 8px 20px rgba(0,0,0,0.32)',
              animation: 'heroFloat2 6s ease-in-out infinite',
            }}>
              <MapPin size={12} color="#DAA520" strokeWidth={2} />
              <span style={{ color: 'white', fontSize: '.63rem', fontWeight: 700 }}>PAN India</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '.58rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.2em' }}>Scroll</span>
          <div style={{
            width: 22, height: 34, borderRadius: 11,
            border: '1.5px solid rgba(255,255,255,0.12)',
            display: 'flex', justifyContent: 'center', paddingTop: 6,
          }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, background: '#DAA520', animation: 'heroScrollDot 1.8s ease-in-out infinite' }} />
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — TRUST BAR
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0C2014', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[
            { Icon: Award,    label: 'TNSDC Recognised', color: '#DAA520' },
            { Icon: Award,    label: 'MSME Certified',   color: '#DAA520' },
            { Icon: Users,    label: 'Growing Learner Community', color: '#7CBF34' },
            { Icon: MapPin,   label: 'Tamil Nadu Based', color: '#7CBF34' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <t.Icon size={15} color={t.color} strokeWidth={2} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2b — LEARNING JOURNEY (LEARN → PRACTICE → CERTIFY → GROW)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F5F7F3', padding: '2.5rem 2rem' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexWrap: 'wrap', gap: '.5rem',
        }}>
          {['Learn', 'Practice', 'Certify', 'Grow'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1.15rem',
                color: '#0C2014', padding: '.5rem 1.3rem', background: 'white',
                borderRadius: 50, border: '1.5px solid rgba(45,106,20,.18)',
              }}>{step}</span>
              {i < 3 && <ArrowRight size={18} color="#DAA520" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — LEARN BY DOMAIN
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              display: 'inline-block', background: '#e8f5e8', color: '#2d6a14',
              fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '.2em', padding: '4px 14px', borderRadius: 20, marginBottom: '1rem',
            }}>Course Categories</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: '#0C2014', marginBottom: '.5rem' }}>
              Learn by Domain
            </h2>
            <p style={{ color: '#6b7280', fontSize: '.95rem' }}>Choose your area of expertise</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.name} cat={cat} onClick={() => navigate('/courses')} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3b — PRACTICAL FARM TRAINING
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0C2014', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(124,191,52,0.12)', color: '#7CBF34',
              fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '.2em', padding: '4px 14px', borderRadius: 20, marginBottom: '1rem',
            }}>Hands-On, Not Just Theory</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: 'white', marginBottom: '.5rem' }}>
              Real Practical Farm Training
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.95rem', maxWidth: 560, margin: '0 auto' }}>
              Polyhouse, hydroponics, vertical farming, mushroom cultivation, microgreens, nursery management,
              open cultivation, irrigation, fertigation and crop management — learned on real IGO Academy farms.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { img: '/domain/polyhouse.jpg', label: 'Polyhouse & Hydroponics' },
              { img: '/courses/mushroom_cultivation.png', label: 'Mushroom Cultivation' },
              { img: '/courses/nursery_management.png', label: 'Nursery Management' },
              { img: '/domain/open-field.jpg', label: 'Open Field Cultivation' },
            ].map(item => (
              <div key={item.label} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '4/5' }}>
                <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%)',
                }} />
                <span style={{
                  position: 'absolute', bottom: '.9rem', left: '.9rem', right: '.9rem',
                  color: 'white', fontWeight: 700, fontSize: '.85rem', fontFamily: "'Sora', sans-serif",
                  textShadow: '0 1px 6px rgba(0,0,0,.5)',
                }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3c — TARGET AUDIENCE
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.6rem', fontWeight: 900, color: '#0C2014', marginBottom: '2rem' }}>
            Built for Every Kind of Learner
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '.6rem' }}>
            {[
              'Farmers', 'Agriculture Students', 'Agriculture Graduates', 'Entrepreneurs',
              'Rural Youth', 'FPO Members', 'SHGs', 'Working Professionals',
              'Students', 'Existing Farm Owners',
            ].map(tag => (
              <span key={tag} style={{
                background: '#F5F7F3', color: '#2d6a14', fontWeight: 700, fontSize: '.85rem',
                padding: '.6rem 1.3rem', borderRadius: 50, border: '1px solid rgba(45,106,20,.15)',
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — IGO ECOSYSTEM STRIP  (brands preview)
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #0f1e12 0%, #0C2014 100%)',
        padding: '5rem 2rem', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <div style={{ width: 48, height: 1, background: 'rgba(197,160,63,0.45)' }} />
              <img
                src="/igo-logo.png"
                alt="IGO Group"
                style={{ height: 30, filter: 'brightness(0) invert(1)', opacity: .65 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span style={{ color: '#C5A03F', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.3em' }}>
                The IGO Group
              </span>
              <div style={{ width: 48, height: 1, background: 'rgba(197,160,63,0.45)' }} />
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '.75rem' }}>
              Part of a Larger{' '}
              <span style={{ color: '#DAA520', fontStyle: 'italic' }}>Ecosystem</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '.92rem', fontWeight: 300, maxWidth: 480, margin: '0 auto' }}>
              IGO Academy is the education arm of the IGO Group — a network of 7 divisions and 26 brands transforming Indian agriculture.
            </p>
          </div>

          {/* 26-brand ticker — two rows, opposite directions */}
          <div style={{ overflow: 'hidden', position: 'relative', padding: '0.25rem 0 0.5rem', userSelect: 'none' }}>

            {/* Row 1: scrolls left */}
            <div style={{
              display: 'flex', gap: '0.75rem', marginBottom: '0.75rem',
              width: 'max-content',
              animation: 'tickerLeft 40s linear infinite',
            }}>
              {[...BRANDS_ROW1, ...BRANDS_ROW1].map((b, i) => (
                <BrandPill key={i} brand={b} onClick={() => navigate('/igo-brands')} />
              ))}
            </div>

            {/* Row 2: scrolls right */}
            <div style={{
              display: 'flex', gap: '0.75rem',
              width: 'max-content',
              animation: 'tickerRight 45s linear infinite',
            }}>
              {[...BRANDS_ROW2, ...BRANDS_ROW2].map((b, i) => (
                <BrandPill key={i} brand={b} onClick={() => navigate('/igo-brands')} />
              ))}
            </div>

            {/* Fade edges */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 96,
              background: 'linear-gradient(90deg, #0f1e12 0%, transparent 100%)',
              zIndex: 2, pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 96,
              background: 'linear-gradient(-90deg, #0f1e12 0%, transparent 100%)',
              zIndex: 2, pointerEvents: 'none',
            }} />
          </div>

          {/* CTA link */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => navigate('/igo-brands')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: '1.5px solid rgba(197,160,63,0.4)',
                color: '#C5A03F', padding: '.75rem 2rem', borderRadius: 50,
                fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
                transition: 'all .18s', letterSpacing: '.04em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,160,63,0.08)'; e.currentTarget.style.borderColor = 'rgba(197,160,63,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(197,160,63,0.4)'; }}
            >
              Explore all 26 brands <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4b — UPCOMING PROGRAMS  (only renders if batches exist)
      ══════════════════════════════════════════════════════════ */}
      {upcomingBatches.length > 0 && (
        <section style={{ background: '#F5F7F3', padding: '5rem 2rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: '#0C2014', marginBottom: '.5rem' }}>
                Upcoming Programs
              </h2>
              <p style={{ color: '#6b7280', fontSize: '.95rem' }}>Register now for the next intake</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {upcomingBatches.map(b => (
                <div key={b.id} style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0C2014', margin: 0 }}>{b.course_title}</h3>
                    <span className="badge badge-green" style={{ flexShrink: 0, fontSize: '.65rem' }}>{b.registration_status}</span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '.8rem', margin: '0 0 1rem' }}>
                    {b.start_date ? dayjs(b.start_date).format('DD MMM YYYY') : 'Rolling admission'}
                    {b.mode ? ` · ${b.mode}` : ''}
                    {b.duration_hours ? ` · ${b.duration_hours}h` : ''}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0C2014', fontFamily: "'Sora', sans-serif" }}>
                      ₹{Number(b.fee ?? b.course_price ?? 0).toLocaleString('en-IN')}
                    </span>
                    <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/courses')}>Register Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 4c — CAREER & ENTREPRENEURSHIP PATHWAYS
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: '#0C2014', marginBottom: '.5rem' }}>
              Two Paths Forward
            </h2>
            <p style={{ color: '#6b7280', fontSize: '.95rem' }}>Whichever you choose, your training carries you the whole way</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#F5F7F3', borderRadius: 20, padding: '2rem', border: '1px solid rgba(45,106,20,.1)' }}>
              <Briefcase size={26} color="#2d6a14" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0C2014', marginBottom: '.9rem' }}>Career Path</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', color: '#4C5B50', fontWeight: 600 }}>
                {['Training', 'Certification', 'Internship', 'Placement Support', 'Employment'].map((s, i, arr) => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                    {s}{i < arr.length - 1 && <ArrowRight size={12} color="#7CBF34" />}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: '#F5F7F3', borderRadius: 20, padding: '2rem', border: '1px solid rgba(218,165,32,.15)' }}>
              <Rocket size={26} color="#DAA520" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0C2014', marginBottom: '.9rem' }}>Business Path</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', color: '#4C5B50', fontWeight: 600 }}>
                {['Training', 'Business Planning', 'Project Planning', 'Farm Setup', 'Technical Guidance', 'Business Growth'].map((s, i, arr) => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                    {s}{i < arr.length - 1 && <ArrowRight size={12} color="#DAA520" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4d — LEARNING MODES
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0C2014', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {[
            { icon: Wifi,      label: 'Online' },
            { icon: Users,     label: 'Offline' },
            { icon: Layers,    label: 'Hybrid' },
            { icon: Building2, label: 'Institutional / Corporate Training' },
          ].map(m => (
            <span key={m.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              color: 'rgba(255,255,255,.75)', fontSize: '.85rem', fontWeight: 700,
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              padding: '.6rem 1.2rem', borderRadius: 50,
            }}>
              <m.icon size={15} color="#DAA520" strokeWidth={2} /> {m.label}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — WHY IGO ACADEMY
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F5F7F3', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: '#0C2014', marginBottom: '.5rem' }}>
              Why Choose IGO Academy?
            </h2>
            <p style={{ color: '#6b7280', fontSize: '.95rem' }}>Built for India's next generation of agri-entrepreneurs</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {WHY.map(card => (
              <WhyCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5b — FAQ
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.9rem', fontWeight: 900, color: '#0C2014', marginBottom: '.5rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#6b7280', fontSize: '.95rem' }}>Everything you need to know before you start</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {HOME_FAQS.map((faq) => (
              <FaqItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0C2014 0%, #1a3d26 100%)',
        padding: '6rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 200, borderRadius: '50%',
          background: 'rgba(45,106,20,0.35)', filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 540, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 1, background: 'rgba(218,165,32,0.5)' }} />
            <span style={{ color: '#DAA520', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.35em' }}>
              Start Learning Today
            </span>
            <div style={{ width: 40, height: 1, background: 'rgba(218,165,32,0.5)' }} />
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '1rem' }}>
            Ready to Build Your<br />
            <span style={{ color: '#DAA520', fontStyle: 'italic' }}>Future in Agriculture?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300 }}>
            Join students and entrepreneurs earning government-recognised agri-skill certificates,
            with practical training and career support built in.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#DAA520', color: 'white', padding: '.9rem 2.25rem',
                borderRadius: 50, fontWeight: 800, fontSize: '.9rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(218,165,32,0.3)',
                transition: 'all .18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0C2014'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#DAA520'; e.currentTarget.style.color = 'white'; }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/courses')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: '1.5px solid rgba(255,255,255,0.25)',
                color: 'white', padding: '.9rem 1.75rem',
                borderRadius: 50, fontWeight: 600, fontSize: '.9rem',
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Browse Courses
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0C2014', padding: '3.5rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

          {/* Brand */}
          <div>
            <img src="/igo-logo.png" alt="IGO Academy" style={{ height: 36, filter: 'brightness(0) invert(1)', marginBottom: '.75rem', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: '1rem', color: 'white', marginBottom: '.35rem' }}>
              IGO Academy
            </div>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '.5rem' }}>
              A platform by IGO Group, Chennai
            </div>
            <div style={{ fontSize: '.82rem', color: '#DAA520', fontWeight: 700 }}>
              Grow. Learn. Lead.
            </div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
              Platform
            </div>
            {[
              ['Explore Courses', '/courses'],
              ['Sign In', '/login'],
              ['Register', '/register'],
            ].map(([label, to]) => (
              <FooterLink key={label} label={label} onClick={() => navigate(to)} />
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
              Company
            </div>
            {[
              ['IGO Group Brands', '/igo-brands'],
              ['About IGO Group', '/igo-brands'],
              ['Contact Us', '/contact'],
              ['Privacy Policy', '/privacy-policy'],
              ['Terms & Conditions', '/terms-and-conditions'],
              ['Refund Policy', '/refund-policy'],
              ['Disclaimer', '/disclaimer'],
            ].map(([label, to]) => (
              <FooterLink key={label} label={label} onClick={() => navigate(to)} />
            ))}
          </div>

          {/* Certifications */}
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
              Recognised By
            </div>
            {['TNSDC — Tamil Nadu Skill Development Corp.', 'MSME — Ministry of MSME, Govt. of India'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '.6rem' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#DAA520', marginTop: 6, flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.78rem', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,.28)', fontSize: '.72rem' }}>
          &copy; 2026 IGO Academy. TNSDC + MSME Recognised | Chennai, Tamil Nadu
        </div>
      </footer>

      <FloatingWhatsApp />
      <MobileStickyBar />

    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function FaqItem({ faq }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ border: '1px solid rgba(0,0,0,.08)', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.1rem 1.4rem', background: open ? '#F5F7F3' : 'white', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#0C2014',
        }}
        aria-expanded={open}
      >
        {faq.question}
        <span style={{ fontSize: '1.1rem', color: '#4FA02E', flexShrink: 0, marginLeft: '1rem' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.4rem 1.1rem', color: '#4C5B50', fontSize: '.88rem', lineHeight: 1.6 }}>
          {faq.answer}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ cat, onClick }) {
  const [hov, setHov] = React.useState(false);
  const [imgErr, setImgErr] = React.useState(false);
  const { Icon } = cat;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
        border: hov ? `2px solid ${cat.color}70` : '1.5px solid rgba(0,0,0,.07)',
        boxShadow: hov ? `0 24px 56px ${cat.color}35, 0 4px 16px rgba(0,0,0,.12)` : '0 2px 10px rgba(0,0,0,.07)',
        transform: hov ? 'translateY(-10px) scale(1.015)' : 'translateY(0) scale(1)',
        transition: 'all .28s cubic-bezier(.22,1,.36,1)', background: 'white',
      }}
    >
      {/* ── Card header: real photo + colour overlay ── */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 180 }}>

        {/* Photo */}
        {cat.img && !imgErr ? (
          <img
            src={cat.img}
            alt={cat.name}
            onError={() => setImgErr(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hov ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
            }}
          />
        ) : (
          /* Fallback: plain gradient */
          <div style={{ position: 'absolute', inset: 0, background: cat.grad.replace(/rgba\(([^)]+),[^)]+\)/g, (_, rgb) => `rgb(${rgb})`) }} />
        )}

        {/* Gradient colour overlay — tints the photo with brand colour */}
        <div style={{
          position: 'absolute', inset: 0,
          background: cat.grad,
          mixBlendMode: 'multiply',
        }} />

        {/* Extra dark bottom fade for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* Content layer */}
        <div style={{ position: 'relative', zIndex: 1, padding: '1.85rem 1.75rem 1.6rem' }}>

          {/* Icon circle */}
          <div style={{
            width: 62, height: 62, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.1rem',
            boxShadow: `0 0 28px ${cat.color}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
            transition: 'all .28s ease',
            ...(hov ? { transform: 'scale(1.1) rotate(-4deg)', boxShadow: `0 0 44px ${cat.color}90, inset 0 1px 0 rgba(255,255,255,0.5)` } : {}),
          }}>
            <Icon size={28} color="white" strokeWidth={1.5} />
          </div>

          {/* Category name */}
          <div style={{
            color: 'white', fontWeight: 800, fontSize: '1.08rem',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-.01em',
            textShadow: '0 1px 8px rgba(0,0,0,0.5)',
          }}>
            {cat.name}
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '1.15rem 1.5rem 1.5rem', background: 'white' }}>
        <p style={{ color: '#6b7280', fontSize: '.84rem', lineHeight: 1.6, marginBottom: '.95rem', margin: '0 0 .95rem' }}>
          {cat.desc}
        </p>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: cat.light, color: cat.tag,
          fontSize: '.72rem', fontWeight: 700, padding: '5px 15px',
          borderRadius: 20, border: `1px solid ${cat.tag}30`,
          transition: 'all .18s',
          ...(hov ? { background: cat.tag, color: 'white', boxShadow: `0 4px 14px ${cat.tag}50` } : {}),
        }}>
          View Courses <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}

function BrandPill({ brand, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        background: hov ? `${brand.color}1a` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hov ? brand.color + '60' : 'rgba(255,255,255,0.09)'}`,
        borderRadius: 50, padding: '7px 14px 7px 8px',
        cursor: 'pointer', transition: 'all .18s',
        boxShadow: hov ? `0 0 18px ${brand.color}28` : 'none',
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: brand.logo ? '#ffffff' : `${brand.color}22`,
        border: `1px solid ${brand.color}38`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.82rem', flexShrink: 0, overflow: 'hidden',
      }}>
        {brand.logo ? (
          <img
            src={brand.logo} alt={brand.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.45)' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = brand.icon; }}
          />
        ) : brand.icon}
      </div>
      <span style={{
        color: hov ? 'white' : 'rgba(255,255,255,0.62)',
        fontSize: '.77rem', fontWeight: 600, whiteSpace: 'nowrap',
        transition: 'color .15s',
      }}>
        {brand.name}
      </span>
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: brand.color, flexShrink: 0, opacity: 0.75,
      }} />
    </div>
  );
}

function EcoDivCard({ div, index, onClick }) {
  const [hov, setHov] = React.useState(false);
  const { Icon } = div;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0, width: 192,
        scrollSnapAlign: 'start',
        background: hov ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
        border: hov ? `1.5px solid ${div.color}` : '1.5px solid rgba(255,255,255,0.09)',
        borderRadius: 20, padding: '1.6rem 1.3rem 1.4rem',
        cursor: 'pointer', transition: 'all .22s cubic-bezier(.22,1,.36,1)',
        textAlign: 'center',
        boxShadow: hov ? `0 12px 32px ${div.color}25` : 'none',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        animationDelay: `${index * 70}ms`,
      }}
      className="card-enter"
    >
      {/* Icon container */}
      <div style={{
        width: 54, height: 54, borderRadius: 16, margin: '0 auto 1rem',
        background: `${div.color}20`, border: `1.5px solid ${div.color}45`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s',
        boxShadow: hov ? `0 0 22px ${div.color}35` : 'none',
      }}>
        <Icon size={24} color={hov ? div.color : 'rgba(255,255,255,0.65)'} strokeWidth={1.5} />
      </div>

      {/* Full division name */}
      <div style={{
        color: hov ? 'white' : 'rgba(255,255,255,0.72)',
        fontSize: '.82rem', fontWeight: 700, lineHeight: 1.35,
        marginBottom: '.7rem', transition: 'color .15s',
        minHeight: '2.25rem',
      }}>
        {div.name}
      </div>

      {/* Brand count badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: hov ? `${div.color}20` : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hov ? div.color + '50' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 50, padding: '3px 12px',
        transition: 'all .18s',
      }}>
        <span style={{
          fontSize: '.63rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '.1em', color: hov ? div.color : 'rgba(255,255,255,0.4)',
          transition: 'color .15s',
        }}>
          {div.count} Brand{div.count !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

function WhyCard({ card }) {
  return (
    <div style={{
      background: 'white', border: '1px solid rgba(0,0,0,.07)',
      borderRadius: 20, padding: '2rem 1.75rem',
      boxShadow: '0 2px 12px rgba(0,0,0,.04)',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 15, flexShrink: 0,
        background: card.light, color: card.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.25rem',
      }}>
        {card.icon}
      </div>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', fontSize: '1rem', marginBottom: '.6rem' }}>
        {card.title}
      </h3>
      <p style={{ color: '#6b7280', fontSize: '.875rem', lineHeight: 1.65 }}>
        {card.text}
      </p>
    </div>
  );
}

function FooterLink({ label, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        color: hov ? '#DAA520' : 'rgba(255,255,255,0.5)',
        fontSize: '.83rem', cursor: 'pointer',
        marginBottom: '.55rem', transition: 'color .15s',
      }}
    >
      {label}
    </div>
  );
}

/* ── Canvas: animated golden dust particles over the hero ────────── */
function HeroCanvas() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth  || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* 70 particles: mix of gold dust + white bokeh */
    const pts = Array.from({ length: 70 }, () => ({
      x:    Math.random() * (canvas.width  || 1400),
      y:    Math.random() * (canvas.height || 800),
      r:    Math.random() * 2.4 + 0.3,
      vx:   (Math.random() - 0.5) * 0.38,
      vy:   -(Math.random() * 0.58 + 0.14),
      a:    Math.random() * 0.42 + 0.07,
      da:   (Math.random() - 0.5) * 0.006,
      gold: Math.random() > 0.42,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.a  = Math.max(0.03, Math.min(0.55, p.a + p.da));
        if (Math.random() < 0.01) p.da = (Math.random() - 0.5) * 0.006;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
        if (p.x < -6)              p.x = canvas.width  + 6;
        if (p.x > canvas.width + 6) p.x = -6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? '#DAA520' : 'rgba(255,255,255,0.9)';
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0, zIndex: 2,
        width: '100%', height: '100%', pointerEvents: 'none',
      }}
    />
  );
}

/* Need React for useState / useRef / useEffect in sub-components */
import React from 'react';

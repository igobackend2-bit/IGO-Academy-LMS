/**
 * HomePage — Public landing page for IGO Academy
 * Revamped 2026-06-26: wheat hero, brands ecosystem strip, improved UI/UX
 */
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Cpu, TrendingUp, ShoppingBag, Recycle, Coffee, GraduationCap,
  ArrowRight, CheckCircle, Award, Users, MapPin,
  Leaf, Fish, Layers, Sun, PawPrint, Building2,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';

/* ── All 26 IGO Group brands for the homepage ticker ──────────────── */
const ALL_BRANDS = [
  { name: 'IGO Agritech Farms',             color: '#2d6a14', icon: '🌾', div: 'Agriculture' },
  { name: 'Farmers Factory',                 color: '#2d6a14', icon: '🏭', div: 'Agriculture' },
  { name: 'Valluvam',                         color: '#2d6a14', icon: '🌿', div: 'Agriculture' },
  { name: 'IGO Agrimart',                    color: '#2d6a14', icon: '🛒', div: 'Agriculture' },
  { name: 'IGO Nursery',                     color: '#2d6a14', icon: '🌱', div: 'Agriculture' },
  { name: 'IGO Crop Care',                   color: '#2d6a14', icon: '🌾', div: 'Agriculture' },
  { name: 'IGO Farm Factories',              color: '#2d6a14', icon: '🏗️', div: 'Agriculture' },
  { name: 'IGO Farm Land Estates',           color: '#2d6a14', icon: '🏡', div: 'Agriculture' },
  { name: 'IGO Farm Automation',             color: '#1d4ed8', icon: '🤖', div: 'Technology' },
  { name: 'Tech Farming Expert',             color: '#1d4ed8', icon: '💡', div: 'Technology' },
  { name: 'IGO Tech Farming Scientists',     color: '#1d4ed8', icon: '🔬', div: 'Technology' },
  { name: 'IGO Fintech',                     color: '#b45309', icon: '💳', div: 'Finance' },
  { name: 'Farm Loans & Grants',             color: '#b45309', icon: '💰', div: 'Finance' },
  { name: 'Tech Farming Wealth Management',  color: '#b45309', icon: '📈', div: 'Finance' },
  { name: 'IGO Exports',                     color: '#6d28d9', icon: '🌍', div: 'Market' },
  { name: 'IGO Mart',                        color: '#6d28d9', icon: '🏪', div: 'Market' },
  { name: 'IGO Franchise',                   color: '#6d28d9', icon: '🤝', div: 'Market' },
  { name: 'IGO Farmgate Buyback',            color: '#6d28d9', icon: '♻️', div: 'Market' },
  { name: 'IGO Organic Pharmacy',            color: '#0e7490', icon: '💊', div: 'Sustainability' },
  { name: 'IGO Natural Cosmetics',           color: '#0e7490', icon: '🌸', div: 'Sustainability' },
  { name: 'IGO Green Energy',                color: '#0e7490', icon: '☀️', div: 'Sustainability' },
  { name: 'India Green',                     color: '#0e7490', icon: '🌍', div: 'Sustainability' },
  { name: 'India Green Organics',            color: '#0e7490', icon: '🥦', div: 'Sustainability' },
  { name: 'Palm Cafe',                       color: '#be123c', icon: '☕', div: 'Consumer' },
  { name: 'Protein Cuts',                    color: '#be123c', icon: '🥩', div: 'Consumer' },
  { name: 'IGO Academy',                     color: '#C5A03F', icon: '🎓', div: 'Education' },
];
const BRANDS_ROW1 = ALL_BRANDS.slice(0, 13);
const BRANDS_ROW2 = ALL_BRANDS.slice(13);

/* ── Category data — matches IGO Academy actual course catalog ──────── */
const CATEGORIES = [
  {
    Icon: Layers,    name: 'Polyhouse & Hydroponics',
    desc: 'Protected cultivation, hydroponic systems & vertical growing',
    color: '#4ade80', grad: 'linear-gradient(135deg,#052e10 0%,#166534 100%)', light: '#dcfce7', tag: '#16a34a',
  },
  {
    Icon: Sun,       name: 'Open Field & Precision Farming',
    desc: 'Scientific crop production & modern precision agriculture',
    color: '#fbbf24', grad: 'linear-gradient(135deg,#3d1c00 0%,#b45309 100%)', light: '#fef3c7', tag: '#d97706',
  },
  {
    Icon: Fish,      name: 'Aquatic Farming',
    desc: 'Mud crab, fish culture & aquaculture management',
    color: '#22d3ee', grad: 'linear-gradient(135deg,#042f2e 0%,#0e7490 100%)', light: '#e0f7fa', tag: '#0891b2',
  },
  {
    Icon: PawPrint,  name: 'Livestock & Animal Husbandry',
    desc: 'Goat farming, breed selection & livestock management',
    color: '#fb923c', grad: 'linear-gradient(135deg,#3d1200 0%,#c2410c 100%)', light: '#ffedd5', tag: '#ea580c',
  },
  {
    Icon: Sprout,    name: 'Specialty Crops',
    desc: 'Mushroom cultivation, microgreens & nursery management',
    color: '#a78bfa', grad: 'linear-gradient(135deg,#1e0050 0%,#6d28d9 100%)', light: '#ede9fe', tag: '#7c3aed',
  },
  {
    Icon: Building2, name: 'Urban & Rooftop Farming',
    desc: 'Terrace gardens, vertical farming & sustainable urban agri',
    color: '#60a5fa', grad: 'linear-gradient(135deg,#0a1640 0%,#1d4ed8 100%)', light: '#dbeafe', tag: '#2563eb',
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

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif" }}>

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

        {/* Background: wheat field */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/wheat_field_sunrise.png')",
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          animation: 'kenBurns 40s ease-in-out infinite alternate',
        }} />

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
              India's Agri<br />
              <span style={{
                color: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #F5D060 0%, #DAA520 55%, #C5A03F 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                fontStyle: 'italic',
              }}>Education</span>
              <br />Platform
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.05rem', color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 500, fontWeight: 300,
            }}>
              Government-recognised agri-skill certification for students, farmers &amp; entrepreneurs —
              from the education arm of the{' '}
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
                onClick={() => navigate('/register')}
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
                Join Free
              </button>
            </div>

            {/* Stats row — divided */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem' }}>
              {[
                { num: '26+',   label: 'IGO Brands' },
                { num: '1000+', label: 'Learners' },
                { num: 'TNSDC', label: 'Approved' },
                { num: 'MSME',  label: 'Certified' },
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

            {/* Main glass card */}
            <div style={{
              width: 340,
              background: 'rgba(6,18,10,0.85)', backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 28, padding: '1.65rem 1.65rem 1.4rem',
              boxShadow: '0 40px 100px rgba(0,0,0,0.60), inset 0 0 0 1px rgba(255,255,255,0.04)',
              position: 'relative', overflow: 'hidden',
            }}>

              {/* Gold shimmer top border */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent 0%, #DAA520 50%, transparent 100%)',
                borderRadius: '28px 28px 0 0',
              }} />

              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em', color: '#C5A03F' }}>
                  Your Learning Journey
                </span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(124,191,52,0.10)', border: '1px solid rgba(124,191,52,0.28)',
                  borderRadius: 50, padding: '3px 10px',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7CBF34', animation: 'heroBlink 1.8s ease-in-out infinite' }} />
                  <span style={{ color: '#7CBF34', fontSize: '.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em' }}>LIVE</span>
                </div>
              </div>

              {/* Active course tile — upgraded */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '.95rem 1rem 1rem', marginBottom: '.7rem',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Green accent stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #22c55e, #7CBF34)', borderRadius: '16px 16px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '.8rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #052e10, #166534)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(34,197,94,0.25)',
                    boxShadow: '0 4px 14px rgba(34,197,94,0.22)',
                  }}>
                    <Leaf size={18} color="#22c55e" strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '.8rem', fontWeight: 700, lineHeight: 1.25 }}>Horticulture Fundamentals</div>
                    <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: '.6rem', marginTop: 3 }}>Module 3 of 6 · Polyhouse &amp; Hydroponics</div>
                  </div>
                </div>
                {/* Progress bar with glow */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 5, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ width: '72%', height: '100%', borderRadius: 20, background: 'linear-gradient(90deg, #7CBF34, #DAA520)', boxShadow: '0 0 8px rgba(124,191,52,0.7)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '.58rem' }}>Progress</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#7CBF34', fontSize: '.62rem', fontWeight: 800 }}>72%</span>
                    <div style={{ background: 'rgba(124,191,52,0.13)', border: '1px solid rgba(124,191,52,0.30)', borderRadius: 5, padding: '2px 7px' }}>
                      <span style={{ color: '#7CBF34', fontSize: '.52rem', fontWeight: 800 }}>▶ Continue</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate earned tile */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(218,165,32,0.08), rgba(197,160,63,0.04))',
                border: '1px solid rgba(218,165,32,0.22)', borderRadius: 13,
                padding: '.8rem 1rem', display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: '.65rem',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(218,165,32,0.12)', border: '1px solid rgba(218,165,32,0.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award size={16} color="#DAA520" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#DAA520', fontSize: '.72rem', fontWeight: 800 }}>Certificate Earned!</div>
                  <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: '.58rem', marginTop: 2 }}>Agri-Business Basics · QR Verified</div>
                </div>
                <div style={{ background: 'rgba(218,165,32,0.10)', border: '1px solid rgba(218,165,32,0.22)', borderRadius: 5, padding: '2px 8px', flexShrink: 0 }}>
                  <span style={{ color: '#DAA520', fontSize: '.5rem', fontWeight: 800 }}>VIEW</span>
                </div>
              </div>

              {/* Next up module */}
              <div style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 11, padding: '.65rem .9rem', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '.56rem', marginBottom: 1 }}>Next Up</div>
                  <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: '.67rem', fontWeight: 600 }}>Nutrient Management · Module 4</div>
                </div>
                <span style={{ color: '#60a5fa', fontSize: '.52rem', fontWeight: 800, flexShrink: 0 }}>UNLOCK</span>
              </div>

              {/* Learner count row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '.85rem', borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {['#22c55e', '#60a5fa', '#f59e0b'].map((c, i) => (
                    <div key={i} style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: `${c}22`, border: `2px solid ${c}55`,
                      marginLeft: i > 0 ? -7 : 0, position: 'relative', zIndex: 3 - i,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={9} color={c} />
                    </div>
                  ))}
                  <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: '.62rem', marginLeft: 8, fontWeight: 600 }}>+1,000 enrolled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'heroBlink 2s ease-in-out infinite' }} />
                  <span style={{ color: '#22c55e', fontSize: '.55rem', fontWeight: 700 }}>Active Now</span>
                </div>
              </div>
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
            { Icon: Users,    label: '1000+ Learners',   color: '#7CBF34' },
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
            Ready to Start Your<br />
            <span style={{ color: '#DAA520', fontStyle: 'italic' }}>Agri Journey?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300 }}>
            Join hundreds of students and entrepreneurs earning government-recognised agri-skill certificates online.
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

    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function CategoryCard({ cat, onClick }) {
  const [hov, setHov] = React.useState(false);
  const { Icon } = cat;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
        border: hov ? `1.5px solid ${cat.color}55` : '1.5px solid rgba(0,0,0,.07)',
        boxShadow: hov ? `0 20px 48px ${cat.color}30, 0 4px 12px rgba(0,0,0,.1)` : '0 2px 8px rgba(0,0,0,.06)',
        transform: hov ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all .25s cubic-bezier(.22,1,.36,1)', background: 'white',
      }}
    >
      {/* ── Card header with gradient + dot pattern ── */}
      <div style={{ background: cat.grad, padding: '2.25rem 1.75rem 1.75rem', position: 'relative', overflow: 'hidden', minHeight: 160 }}>

        {/* Dot grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }} />

        {/* Corner glow */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${cat.color}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Icon circle */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: 68, height: 68, borderRadius: '50%',
          background: `rgba(255,255,255,0.12)`,
          border: `1.5px solid rgba(255,255,255,0.25)`,
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: `0 0 28px ${cat.color}50, inset 0 1px 0 rgba(255,255,255,0.3)`,
          transition: 'all .25s ease',
          ...(hov ? { boxShadow: `0 0 40px ${cat.color}80, inset 0 1px 0 rgba(255,255,255,0.4)`, transform: 'scale(1.08)' } : {}),
        }}>
          <Icon size={32} color="white" strokeWidth={1.5} />
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          color: 'white', fontWeight: 800, fontSize: '1.1rem',
          fontFamily: "'Sora', sans-serif", letterSpacing: '-.01em',
        }}>
          {cat.name}
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
        <p style={{ color: '#6b7280', fontSize: '.85rem', lineHeight: 1.55, marginBottom: '1rem' }}>
          {cat.desc}
        </p>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: cat.light, color: cat.tag,
          fontSize: '.72rem', fontWeight: 700, padding: '4px 14px',
          borderRadius: 20, border: `1px solid ${cat.tag}25`,
          transition: 'all .15s',
          ...(hov ? { background: cat.tag, color: 'white' } : {}),
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
        background: `${brand.color}22`, border: `1px solid ${brand.color}38`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.82rem', flexShrink: 0,
      }}>
        {brand.icon}
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

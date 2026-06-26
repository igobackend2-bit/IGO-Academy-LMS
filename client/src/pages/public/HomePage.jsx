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

/* ── Ecosystem divisions (preview strip) ──────────────────────────── */
const ECO = [
  { id: 'agriculture',   name: 'Agriculture & Production',  Icon: Sprout,       count: 8,  color: '#2d6a14' },
  { id: 'technology',    name: 'Technology & Innovation',   Icon: Cpu,          count: 3,  color: '#1d4ed8' },
  { id: 'finance',       name: 'Finance & Empowerment',     Icon: TrendingUp,   count: 3,  color: '#b45309' },
  { id: 'market',        name: 'Market & Distribution',     Icon: ShoppingBag,  count: 4,  color: '#6d28d9' },
  { id: 'sustainability',name: 'Sustainability & Lifestyle', Icon: Recycle,      count: 5,  color: '#0e7490' },
  { id: 'consumer',      name: 'Consumer & Experience',     Icon: Coffee,       count: 2,  color: '#be123c' },
  { id: 'education',     name: 'Knowledge & Development',   Icon: GraduationCap,count: 1,  color: '#C5A03F' },
];

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
              Tamil Nadu.
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
              width: 308,
              background: 'rgba(12,32,20,0.72)', backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 28, padding: '1.75rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)',
              position: 'relative', overflow: 'hidden',
            }}>

              {/* Gold shimmer top border */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent 0%, #DAA520 50%, transparent 100%)',
                borderRadius: '28px 28px 0 0',
              }} />

              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
                <span style={{ fontSize: '.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: '#C5A03F' }}>
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

              {/* Active course tile */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '.95rem 1.1rem', marginBottom: '.875rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.8rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: 'linear-gradient(135deg, #052e10, #166534)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(34,197,94,0.22)',
                  }}>
                    <Leaf size={17} color="#22c55e" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: '.8rem', fontWeight: 700, lineHeight: 1.25 }}>Horticulture Fundamentals</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '.62rem', marginTop: 2 }}>Module 3 of 6</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 20, height: 4, overflow: 'hidden', marginBottom: 5 }}>
                  <div style={{ width: '72%', height: '100%', borderRadius: 20, background: 'linear-gradient(90deg, #7CBF34, #DAA520)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: '.58rem' }}>Progress</span>
                  <span style={{ color: '#DAA520', fontSize: '.62rem', fontWeight: 800 }}>72%</span>
                </div>
              </div>

              {/* Certificate earned tile */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(218,165,32,0.09), rgba(197,160,63,0.05))',
                border: '1px solid rgba(218,165,32,0.22)', borderRadius: 14,
                padding: '.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: '1.2rem',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(218,165,32,0.12)', border: '1px solid rgba(218,165,32,0.32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award size={18} color="#DAA520" strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ color: '#DAA520', fontSize: '.75rem', fontWeight: 800 }}>Certificate Earned!</div>
                  <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: '.6rem', marginTop: 2 }}>Agri-Business Basics · QR Verified</div>
                </div>
              </div>

              {/* Learner count */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '.62rem', marginLeft: 8 }}>+1,000</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '.58rem' }}>enrolled</span>
              </div>
            </div>

            {/* Floating badge — TNSDC (top-left) */}
            <div style={{
              position: 'absolute', top: -18, left: -22,
              background: 'rgba(10,24,16,0.90)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,191,52,0.32)', borderRadius: 50,
              padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 8px 20px rgba(0,0,0,0.32)',
              animation: 'heroFloat 5s ease-in-out infinite',
            }}>
              <Award size={12} color="#7CBF34" strokeWidth={2} />
              <span style={{ color: 'white', fontSize: '.63rem', fontWeight: 700 }}>TNSDC Approved</span>
            </div>

            {/* Floating badge — Tamil Nadu (bottom-right) */}
            <div style={{
              position: 'absolute', bottom: -16, right: -28,
              background: 'rgba(10,24,16,0.90)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(218,165,32,0.32)', borderRadius: 50,
              padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 8px 20px rgba(0,0,0,0.32)',
              animation: 'heroFloat2 6s ease-in-out infinite',
            }}>
              <MapPin size={12} color="#DAA520" strokeWidth={2} />
              <span style={{ color: 'white', fontSize: '.63rem', fontWeight: 700 }}>Tamil Nadu Based</span>
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

          {/* Division cards — horizontal scroll with snap */}
          <div style={{
            display: 'flex', gap: '1rem', overflowX: 'auto',
            paddingBottom: '1.25rem', scrollbarWidth: 'none',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
          }}
          className="eco-scroll"
          >
            {ECO.map((div, i) => (
              <EcoDivCard key={div.id} div={div} index={i} onClick={() => navigate('/igo-brands')} />
            ))}
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

/* Need React for useState in sub-components */
import React from 'react';

/**
 * HomePage — Public landing page for IGO Academy
 * Revamped 2026-06-26: wheat hero, brands ecosystem strip, improved UI/UX
 */
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Cpu, TrendingUp, ShoppingBag, Recycle, Coffee, GraduationCap,
  ArrowRight, CheckCircle, Award, Users, MapPin,
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

/* ── Category data ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { icon: '🌱', name: 'Horticulture', desc: 'Plant & crop cultivation techniques',   color: '#2d6a14', light: '#e8f5e8' },
  { icon: '🐟', name: 'Aquaculture',  desc: 'Fish farming & water management',       color: '#0e7490', light: '#e0f7fa' },
  { icon: '📦', name: 'Agri-Biz',     desc: 'Supply chain & market strategies',     color: '#6d28d9', light: '#ede9fe' },
  { icon: '💧', name: 'Agri-Tech',    desc: 'Smart irrigation & precision farming', color: '#1d4ed8', light: '#dbeafe' },
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
          SECTION 1 — HERO  (wheat field, left-aligned split)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Background: wheat field with Ken Burns */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/wheat_field_sunrise.png')",
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          animation: 'kenBurns 40s ease-in-out infinite alternate',
        }} />

        {/* Gradient overlay: dark on left for text, lighter on right to show image */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(100deg, rgba(12,32,20,0.93) 0%, rgba(12,32,20,0.80) 45%, rgba(12,32,20,0.40) 75%, rgba(12,32,20,0.20) 100%)',
          zIndex: 1,
        }} />

        {/* Gold vignette glow at top-right (sun position) */}
        <div style={{
          position: 'absolute', top: '-5%', right: '-5%', zIndex: 1,
          width: '50%', height: '70%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(218,165,32,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 1160, margin: '0 auto',
          padding: '6rem 2rem 5rem',
          display: 'flex', alignItems: 'center', gap: '3rem',
        }}>

          {/* Left: text block */}
          <div style={{ flex: '0 0 auto', maxWidth: 580 }}>

            {/* Logo + badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <img
                src="/igo-logo.png"
                alt="IGO Academy"
                style={{ height: 44, filter: 'brightness(0) invert(1)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span style={{
                background: 'rgba(197,160,63,0.18)', border: '1px solid rgba(197,160,63,0.45)',
                color: '#C5A03F', fontSize: '.65rem', fontWeight: 800,
                padding: '5px 14px', borderRadius: 20,
                textTransform: 'uppercase', letterSpacing: '.18em',
              }}>
                TNSDC + MSME Recognised
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(2.6rem,5.5vw,4.2rem)',
              fontWeight: 900, color: 'white', lineHeight: 1.05,
              marginBottom: '1.5rem', letterSpacing: '-.02em',
            }}>
              Grow.{' '}
              <span style={{ color: '#DAA520', fontStyle: 'italic' }}>Learn.</span>
              <br />Lead.
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 480,
              fontWeight: 300,
            }}>
              India's agri-entrepreneurship learning platform — delivering
              government-recognised certification to students, farmers &amp;
              entrepreneurs across Tamil Nadu.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <button
                onClick={() => navigate('/courses')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: '#DAA520', color: 'white',
                  padding: '.9rem 2rem', borderRadius: 50,
                  fontWeight: 800, fontSize: '.9rem', border: 'none',
                  cursor: 'pointer', letterSpacing: '.04em',
                  boxShadow: '0 8px 28px rgba(218,165,32,0.35)',
                  transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0C2014'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#DAA520'; e.currentTarget.style.color = 'white'; }}
              >
                Explore Courses <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  color: 'white', padding: '.9rem 1.75rem',
                  borderRadius: 50, fontWeight: 600, fontSize: '.9rem',
                  cursor: 'pointer', transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Join Free
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              {[
                { num: '26+',  label: 'Brands' },
                { num: '7',    label: 'Divisions' },
                { num: 'TNSDC', label: 'Approved' },
                { num: 'MSME', label: 'Certified' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'white', lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
                    {s.num}
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: '.2rem' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating trust card (desktop only) */}
          <div className="public-nav-links" style={{
            flex: 1, display: 'flex', justifyContent: 'flex-end',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 24, padding: '2rem',
              width: 280, flexShrink: 0,
            }}>
              <div style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.2em', color: '#DAA520', marginBottom: '1.25rem' }}>
                Why IGO Academy?
              </div>
              {[
                '100% Online & Self-Paced',
                'TNSDC + MSME Recognised',
                'QR-Verified Certificate',
                'Expert Agri-Practitioners',
                'Tamil Nadu Based',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.75rem' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(218,165,32,0.2)', border: '1px solid rgba(218,165,32,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={11} color="#DAA520" />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '.83rem', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/register')}
                style={{
                  width: '100%', marginTop: '.75rem', padding: '.8rem',
                  background: 'rgba(218,165,32,0.15)', border: '1px solid rgba(218,165,32,0.35)',
                  color: '#DAA520', borderRadius: 12, fontWeight: 700,
                  fontSize: '.82rem', cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(218,165,32,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(218,165,32,0.15)'; }}
              >
                Get Started Free →
              </button>
            </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 1, background: 'rgba(197,160,63,0.5)' }} />
              <span style={{ color: '#C5A03F', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.3em' }}>
                The IGO Group
              </span>
              <div style={{ width: 36, height: 1, background: 'rgba(197,160,63,0.5)' }} />
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '.75rem' }}>
              Part of a Larger{' '}
              <span style={{ color: '#DAA520', fontStyle: 'italic' }}>Ecosystem</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '.92rem', fontWeight: 300, maxWidth: 480, margin: '0 auto' }}>
              IGO Academy is the education arm of the IGO Group — a network of 7 divisions and 26 brands transforming Indian agriculture.
            </p>
          </div>

          {/* Division cards — horizontal scroll on mobile */}
          <div style={{
            display: 'flex', gap: '1rem', overflowX: 'auto',
            paddingBottom: '1rem', scrollbarWidth: 'none',
          }}>
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
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        border: hov ? `1.5px solid ${cat.color}` : '1.5px solid rgba(0,0,0,.07)',
        boxShadow: hov ? `0 12px 32px ${cat.color}25` : '0 1px 4px rgba(0,0,0,.05)',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all .2s ease', background: 'white',
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, #0C2014, ${cat.color})`,
        padding: '2rem 1.5rem',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>{cat.icon}</div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', fontFamily: "'Sora', sans-serif" }}>{cat.name}</div>
      </div>
      <div style={{ padding: '1.25rem' }}>
        <p style={{ color: '#6b7280', fontSize: '.83rem', lineHeight: 1.5, marginBottom: '.75rem' }}>{cat.desc}</p>
        <span style={{
          background: cat.light, color: cat.color,
          fontSize: '.7rem', fontWeight: 700, padding: '3px 12px', borderRadius: 20,
        }}>
          View Courses →
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
        flexShrink: 0, width: 160,
        background: hov ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
        border: hov ? `1.5px solid ${div.color}` : '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 18, padding: '1.5rem 1.25rem',
        cursor: 'pointer', transition: 'all .18s ease',
        textAlign: 'center',
        animationDelay: `${index * 70}ms`,
      }}
      className="card-enter"
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, margin: '0 auto .875rem',
        background: `${div.color}22`, border: `1px solid ${div.color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .18s',
      }}>
        <Icon size={22} color={hov ? div.color : 'rgba(255,255,255,0.6)'} strokeWidth={1.5} />
      </div>
      <div style={{
        color: hov ? 'white' : 'rgba(255,255,255,0.65)',
        fontSize: '.8rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '.4rem',
        transition: 'color .15s',
      }}>
        {div.name.split(' ').slice(0, 2).join(' ')}
      </div>
      <div style={{
        fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '.1em', color: div.color, opacity: hov ? 1 : 0.7,
      }}>
        {div.count} Brand{div.count !== 1 ? 's' : ''}
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

import { useNavigate } from 'react-router-dom';
import PublicNav from '@/components/layout/PublicNav';
import {
  GraduationCap, Target, Eye, Award, Users, MapPin, ArrowRight,
  Sprout, Layers, Sun, Fish, PawPrint, Building2, CheckCircle,
  Globe, BookOpen, Cpu, Heart,
} from 'lucide-react';

/* ── Pillars ──────────────────────────────────────────────────────── */
const PILLARS = [
  {
    Icon: Target,
    title: 'Our Mission',
    text: 'To make practical agri-education accessible across India — equipping every farmer, student, and rural entrepreneur with government-recognised skills that create real livelihoods.',
    color: '#22c55e', light: 'rgba(34,197,94,0.10)',
  },
  {
    Icon: Eye,
    title: 'Our Vision',
    text: 'A future where every Indian who wants to grow food, build an agri-business, or lead sustainable farming has the knowledge and certification to do it.',
    color: '#DAA520', light: 'rgba(218,165,32,0.10)',
  },
  {
    Icon: Heart,
    title: 'Our Values',
    text: 'Practical knowledge over theory. Community over competition. Real certifications that open real doors. We exist to serve the farmer, not the certificate.',
    color: '#60a5fa', light: 'rgba(96,165,250,0.10)',
  },
];

/* ── Domains ──────────────────────────────────────────────────────── */
const DOMAINS = [
  { Icon: Layers,    name: 'Polyhouse & Hydroponics',        color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
  { Icon: Sun,       name: 'Open Field & Precision Farming', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
  { Icon: Fish,      name: 'Aquatic Farming',                color: '#22d3ee', bg: 'rgba(34,211,238,0.08)'  },
  { Icon: PawPrint,  name: 'Livestock & Animal Husbandry',   color: '#fb923c', bg: 'rgba(251,146,60,0.08)'  },
  { Icon: Sprout,    name: 'Specialty Crops',                color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  { Icon: Building2, name: 'Urban & Rooftop Farming',        color: '#60a5fa', bg: 'rgba(96,165,250,0.08)'  },
];

/* ── Recognitions ─────────────────────────────────────────────────── */
const RECOGNITIONS = [
  { label: 'TNSDC Recognised', sub: 'Tamil Nadu Skill Development Corporation', color: '#22c55e' },
  { label: 'MSME Certified',   sub: 'Ministry of MSME, Govt. of India',        color: '#DAA520' },
  { label: '1,000+ Learners',  sub: 'Trained across Tamil Nadu & beyond',      color: '#60a5fa' },
  { label: 'PAN India Reach',  sub: 'Online + offline hybrid programmes',      color: '#fb923c' },
];

/* ── Formula blocks ─────────────────────────────────────────────── */
const FORMULA = [
  { num: '1',   label: 'Farmpreneur',    sub: 'Owner & project lead',     color: '#DAA520', border: 'rgba(218,165,32,0.35)', bg: 'rgba(218,165,32,0.08)', op: null },
  { num: '+',   label: '',               sub: '',                          color: 'rgba(255,255,255,0.30)', border: 'transparent', bg: 'transparent', op: true },
  { num: '5',   label: 'Direct Jobs',    sub: "Farmer's family",           color: '#22c55e', border: 'rgba(34,197,94,0.35)',  bg: 'rgba(34,197,94,0.08)',  op: null },
  { num: '+',   label: '',               sub: '',                          color: 'rgba(255,255,255,0.30)', border: 'transparent', bg: 'transparent', op: true },
  { num: '10',  label: 'Indirect Jobs',  sub: 'Local community',          color: '#60a5fa', border: 'rgba(96,165,250,0.35)', bg: 'rgba(96,165,250,0.08)', op: null },
  { num: '=',   label: '',               sub: '',                          color: 'rgba(255,255,255,0.30)', border: 'transparent', bg: 'transparent', op: true },
  { num: '15',  label: 'Livelihoods',    sub: 'Permanent, per project',   color: '#F5D060', border: 'rgba(245,208,96,0.50)',  bg: 'rgba(245,208,96,0.12)', op: null, highlight: true },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Manrope', sans-serif", background: '#F5F7F3' }}>
      <PublicNav />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0C2014 0%, #0f2918 55%, #0a1e10 100%)',
        padding: '6rem 2rem 5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        {/* Gold orb */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-5%', width: '45%', height: '90%',
          borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(218,165,32,0.09) 0%,transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem',
            background: 'rgba(197,160,63,0.09)', border: '1px solid rgba(197,160,63,0.25)',
            borderRadius: 50, padding: '6px 18px',
          }}>
            <GraduationCap size={14} color="#C5A03F" />
            <span style={{ color: '#C5A03F', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em' }}>
              About IGO Academy
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight: 900, color: 'white', lineHeight: 1.08,
            letterSpacing: '-.03em', marginBottom: '1.5rem',
          }}>
            India's Agri-Education{' '}
            <span style={{
              color: 'transparent',
              backgroundImage: 'linear-gradient(135deg, #F5D060 0%, #DAA520 55%, #C5A03F 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', fontStyle: 'italic',
            }}>
              Platform
            </span>
          </h1>

          <p style={{
            fontSize: '1.08rem', color: 'rgba(255,255,255,0.52)',
            lineHeight: 1.78, maxWidth: 640, margin: '0 auto 2.5rem', fontWeight: 300,
          }}>
            IGO Academy is the education arm of the <strong style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>IGO Group</strong> — a PAN India agri-conglomerate
            spanning 7 divisions and 26 brands. We train farmers, students, and rural entrepreneurs
            with government-recognised certification in modern agricultural practices.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/courses')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'linear-gradient(135deg, #DAA520, #C5A03F)',
                color: 'white', padding: '.85rem 2rem', borderRadius: 50,
                fontWeight: 800, fontSize: '.88rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(218,165,32,.38)', letterSpacing: '.04em',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Explore Courses <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/igo-brands')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.20)',
                color: 'white', padding: '.85rem 1.75rem', borderRadius: 50,
                fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              IGO Group
            </button>
          </div>
        </div>
      </section>

      {/* ── RECOGNITION BAR ──────────────────────────────────────── */}
      <section style={{ background: '#0C2014', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {RECOGNITIONS.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} color={r.color} strokeWidth={2} />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '.72rem', fontWeight: 700 }}>{r.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '.58rem' }}>{r.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION / VISION / VALUES ─────────────────────────────── */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ color: '#C5A03F', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: '.75rem' }}>
              What Drives Us
            </p>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.7rem,3vw,2.6rem)', fontWeight: 900, color: '#0C2014', letterSpacing: '-.025em' }}>
              Purpose-built for India's Agri Future
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {PILLARS.map(p => (
              <div key={p.title} style={{
                background: '#FAFBF8', border: '1px solid rgba(0,0,0,.06)',
                borderRadius: 22, padding: '2.25rem 2rem',
                boxShadow: '0 2px 14px rgba(0,0,0,.04)',
                transition: 'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,.04)'; }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 15, marginBottom: '1.4rem',
                  background: p.light, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p.Icon size={24} color={p.color} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', fontSize: '1.05rem', marginBottom: '.75rem' }}>
                  {p.title}
                </h3>
                <p style={{ color: '#5a6b60', fontSize: '.9rem', lineHeight: 1.72, fontWeight: 400 }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE TEACH ─────────────────────────────────────────── */}
      <section style={{ background: '#F5F7F3', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: '#C5A03F', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: '.75rem' }}>
              Course Domains
            </p>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.7rem,3vw,2.5rem)', fontWeight: 900, color: '#0C2014', letterSpacing: '-.025em', marginBottom: '.9rem' }}>
              6 Agri Domains, Real Skills
            </h2>
            <p style={{ color: '#6b7280', fontSize: '.95rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Every programme is hands-on, field-tested, and aligned with government skilling frameworks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))', gap: '1rem' }}>
            {DOMAINS.map(d => (
              <div
                key={d.name}
                onClick={() => navigate('/courses')}
                style={{
                  background: 'white', border: '1px solid rgba(0,0,0,.06)',
                  borderRadius: 18, padding: '1.5rem 1.6rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'all .18s',
                  boxShadow: '0 1px 8px rgba(0,0,0,.04)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = d.color + '50'; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 18px ${d.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,.04)'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <d.Icon size={20} color={d.color} strokeWidth={1.8} />
                </div>
                <span style={{ fontWeight: 700, color: '#0C2014', fontSize: '.88rem', lineHeight: 1.3 }}>{d.name}</span>
                <ArrowRight size={14} color={d.color} style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FARMPRENEUR MISSION FORMULA ──────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #061208 0%, #0C2014 50%, #0a1c10 100%)',
        padding: '5.5rem 2rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }} />
        {/* Gold glow center */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '60%', height: '70%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(218,165,32,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1020, margin: '0 auto', position: 'relative', textAlign: 'center' }}>

          {/* Label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem',
            background: 'rgba(197,160,63,0.09)', border: '1px solid rgba(197,160,63,0.25)',
            borderRadius: 50, padding: '5px 18px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C5A03F' }} />
            <span style={{ color: '#C5A03F', fontSize: '.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em' }}>
              The IGO Mission
            </span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
            fontWeight: 900, color: 'white', lineHeight: 1.1,
            letterSpacing: '-.03em', marginBottom: '1rem',
          }}>
            One Project. One Farmpreneur.
          </h2>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
            fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-.03em', marginBottom: '1.5rem',
            color: 'transparent',
            backgroundImage: 'linear-gradient(135deg, #F5D060 0%, #DAA520 55%, #C5A03F 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            fontStyle: 'italic',
          }}>
            15 Permanent Livelihoods.
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.48)', fontSize: '1rem', lineHeight: 1.75,
            maxWidth: 560, margin: '0 auto 3.5rem', fontWeight: 300,
          }}>
            Every farmpreneur trained by IGO Academy doesn't just build a business —
            they create a permanent ring of employment around them. This is our formula.
          </p>

          {/* Formula row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '0.75rem', marginBottom: '3.5rem',
          }}>
            {FORMULA.map((f, i) => f.op ? (
              <div key={i} style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900,
                color: 'rgba(255,255,255,0.22)', lineHeight: 1, userSelect: 'none',
              }}>
                {f.num}
              </div>
            ) : (
              <div key={i} style={{
                background: f.bg,
                border: `1.5px solid ${f.border}`,
                borderRadius: 22,
                padding: f.highlight ? '1.5rem 2rem' : '1.25rem 1.75rem',
                minWidth: f.highlight ? 130 : 110,
                textAlign: 'center',
                boxShadow: f.highlight ? `0 0 40px ${f.color}22, inset 0 0 0 1px ${f.color}18` : 'none',
                position: 'relative',
              }}>
                {f.highlight && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                    borderRadius: '22px 22px 0 0',
                  }} />
                )}
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: f.highlight ? 'clamp(2.8rem, 5vw, 4rem)' : 'clamp(2.2rem, 4vw, 3.2rem)',
                  fontWeight: 900, color: f.color, lineHeight: 1,
                  marginBottom: '.5rem',
                }}>
                  {f.num}
                </div>
                <div style={{ color: 'white', fontSize: '.75rem', fontWeight: 700, marginBottom: '.2rem' }}>
                  {f.label}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: '.6rem', fontWeight: 400 }}>
                  {f.sub}
                </div>
              </div>
            ))}
          </div>

          {/* 1 Million Goal bar */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '2rem 2.5rem',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'center', gap: '2rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900,
                background: 'linear-gradient(135deg, #F5D060, #DAA520)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                lineHeight: 1,
              }}>
                1,000,000
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.15em', marginTop: '.4rem', fontWeight: 700 }}>
                Farmpreneurs — Our Goal
              </div>
            </div>

            <div style={{ width: 1, height: 52, background: 'rgba(255,255,255,0.08)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>
                15M
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.15em', marginTop: '.4rem', fontWeight: 700 }}>
                Livelihoods Created
              </div>
            </div>

            <div style={{ width: 1, height: 52, background: 'rgba(255,255,255,0.08)' }} />

            <div style={{ maxWidth: 320, textAlign: 'left' }}>
              <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: '.88rem', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                When 1 million farmpreneurs each create 15 livelihoods, we solve rural unemployment
                at a scale no government scheme ever has — through market-led, skill-driven enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FARMPRENEUR DEFINITION ───────────────────────────────── */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: '#C5A03F', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: '.75rem' }}>
              What Is a Farmpreneur?
            </p>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 900, color: '#0C2014', letterSpacing: '-.025em', marginBottom: '1rem' }}>
              A Farmer Who Also Runs a Business
            </h2>
            <p style={{ color: '#6b7280', fontSize: '.97rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              A farmpreneur is trained not just to grow crops — but to own a profitable agri-enterprise,
              hire people, serve markets, and build lasting community wealth.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
            {[
              { num: '01', title: 'Skill Certified', desc: 'Government-recognised certification in an agri-domain — valid for loans, jobs, and govt schemes.', color: '#DAA520', light: 'rgba(218,165,32,0.08)' },
              { num: '02', title: 'Enterprise Ready', desc: 'Trained to launch, manage, and scale a farm-based business — not just grow a crop.', color: '#22c55e', light: 'rgba(34,197,94,0.08)' },
              { num: '03', title: 'Job Creator', desc: 'Every farmpreneur directly employs 5 family members and supports 10 more in their community.', color: '#60a5fa', light: 'rgba(96,165,250,0.08)' },
              { num: '04', title: 'IGO Ecosystem', desc: 'Connected to IGO\'s 26-brand network for inputs, market access, buyback, and growth capital.', color: '#a78bfa', light: 'rgba(167,139,250,0.08)' },
            ].map(c => (
              <div key={c.num} style={{
                background: '#FAFBF8', border: '1px solid rgba(0,0,0,.055)',
                borderRadius: 20, padding: '1.75rem 1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,.04)',
                transition: 'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.04)'; }}
              >
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  color: c.color, lineHeight: 1, marginBottom: '1rem',
                  background: c.light, borderRadius: 12, width: 52, height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.82rem', fontWeight: 800,
                }}>
                  {c.num}
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0C2014', fontSize: '.95rem', marginBottom: '.6rem' }}>
                  {c.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '.85rem', lineHeight: 1.68, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IGO GROUP CONNECT ─────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0C2014 0%, #0f2918 100%)',
        padding: '5rem 2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-8%', width: '40%', height: '90%',
          borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(45,106,20,0.22) 0%,transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 380px' }}>
              <p style={{ color: '#C5A03F', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: '1rem' }}>
                Part of Something Bigger
              </p>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: 'white', letterSpacing: '-.025em', marginBottom: '1.25rem', lineHeight: 1.12 }}>
                The IGO Group Ecosystem
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '.95rem', lineHeight: 1.78, marginBottom: '2rem', fontWeight: 300 }}>
                IGO Academy is backed by the full weight of the IGO Group — a network of <strong style={{ color: 'rgba(255,255,255,0.78)', fontWeight: 600 }}>7 divisions and 26 brands</strong> covering
                agritech, fintech, exports, organic lifestyle, and more. Our students don't just learn
                — they enter an ecosystem where their skills connect to real employment and enterprise opportunities.
              </p>
              {[
                { Icon: Globe,     text: '26 brands across 7 agri-sectors' },
                { Icon: Cpu,       text: 'Technology & automation verticals' },
                { Icon: BookOpen,  text: 'Farm-to-market training pipeline' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.75rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(197,160,63,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.Icon size={14} color="#C5A03F" strokeWidth={1.8} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: '.88rem', fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/igo-brands')}
                style={{
                  marginTop: '1.5rem',
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  background: 'transparent', border: '1.5px solid rgba(197,160,63,0.38)',
                  color: '#C5A03F', padding: '.75rem 1.75rem', borderRadius: 50,
                  fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
                  transition: 'all .18s', letterSpacing: '.04em',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,160,63,0.08)'; e.currentTarget.style.borderColor = 'rgba(197,160,63,0.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(197,160,63,0.38)'; }}
              >
                Explore all 26 brands <ArrowRight size={14} />
              </button>
            </div>

            {/* Stats grid */}
            <div style={{ flex: '0 0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { num: '7',     label: 'Divisions',     color: '#DAA520' },
                { num: '26',    label: 'Brands',        color: '#22c55e' },
                { num: '1K+',   label: 'Learners',      color: '#60a5fa' },
                { num: '2018',  label: 'Founded',       color: '#C5A03F' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 18, padding: '1.5rem 1.25rem', textAlign: 'center', minWidth: 110,
                }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                    {s.num}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: '.4rem' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ background: '#F5F7F3', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem',
            background: 'rgba(44,130,20,0.09)', border: '1px solid rgba(44,130,20,0.18)',
            borderRadius: 50, padding: '6px 18px',
          }}>
            <Award size={13} color="#2d6a14" />
            <span style={{ color: '#2d6a14', fontSize: '.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em' }}>TNSDC + MSME Recognised</span>
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.7rem,3vw,2.6rem)', fontWeight: 900, color: '#0C2014', letterSpacing: '-.025em', marginBottom: '1rem' }}>
            Ready to Grow?
          </h2>
          <p style={{ color: '#6b7280', fontSize: '.97rem', lineHeight: 1.72, marginBottom: '2.25rem' }}>
            Join 1,000+ learners building real agri-skills with government-recognised certificates you can use for loans, jobs, and starting your own farm enterprise.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'linear-gradient(135deg, #2d6a14, #166534)',
                color: 'white', padding: '.9rem 2.25rem', borderRadius: 50,
                fontWeight: 800, fontSize: '.9rem', border: 'none', cursor: 'pointer',
                letterSpacing: '.04em', boxShadow: '0 8px 28px rgba(45,106,20,.35)',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Join Free Today <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/courses')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'white', border: '1.5px solid rgba(0,0,0,0.12)',
                color: '#0C2014', padding: '.9rem 1.85rem', borderRadius: 50,
                fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.28)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
            >
              Browse Courses
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

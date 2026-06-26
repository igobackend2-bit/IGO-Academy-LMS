/**
 * IGO Group Brands Directory
 * Showcases all 7 divisions and 26 brands of the IGO ecosystem.
 * Adapted from IgoGroupBrands.tsx — enhanced for LMS with CSS animations.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Cpu, TrendingUp, ShoppingBag,
  Recycle, Coffee, GraduationCap, ArrowLeft, ArrowRight,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';

/* ── Brand data (sourced from IGO Group ecosystem) ─────────────────────── */
const DIVISIONS = [
  {
    id: 'agriculture',
    name: 'Agriculture & Production',
    subtitle: 'Powering production at every level',
    icon: Sprout,
    color: '#2d6a14',
    light: 'rgba(45,106,20,0.08)',
    border: 'rgba(45,106,20,0.2)',
    brands: [
      { id: 'igo-agritech',   name: 'IGO Agritech Farms',       icon: '🌾' },
      { id: 'farmers-fac',    name: 'Farmers Factory',           icon: '🏭' },
      { id: 'valluvam',       name: 'Valluvam',                  icon: '🌿' },
      { id: 'igo-agrimart',   name: 'IGO Agrimart',             icon: '🛒' },
      { id: 'igo-nursery',    name: 'IGO Nursery',              icon: '🌱' },
      { id: 'igo-cropcare',   name: 'IGO Crop Care',            icon: '🌾' },
      { id: 'igo-farmfac',   name: 'IGO Farm Factories',        icon: '🏗️' },
      { id: 'igo-farmland',  name: 'IGO Farm Land Estates',     icon: '🏡' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology & Innovation',
    subtitle: 'Enabling smarter farming',
    icon: Cpu,
    color: '#1d4ed8',
    light: 'rgba(29,78,216,0.07)',
    border: 'rgba(29,78,216,0.2)',
    brands: [
      { id: 'igo-auto',   name: 'IGO Farm Automation',                    icon: '🤖' },
      { id: 'tech-farm',  name: 'Tech Farming Expert',                    icon: '💡' },
      { id: 'igo-sci',    name: 'IGO Tech Farming Scientists Foundation', icon: '🔬' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Empowerment',
    subtitle: 'Strengthening farmers with financial access',
    icon: TrendingUp,
    color: '#b45309',
    light: 'rgba(180,83,9,0.07)',
    border: 'rgba(180,83,9,0.2)',
    brands: [
      { id: 'igo-fintech', name: 'IGO Fintech',                         icon: '💳' },
      { id: 'farm-loans',  name: 'Farm Loans, Subsidy & Grants',         icon: '💰' },
      { id: 'tfwm',        name: 'Tech Farming Wealth Management',       icon: '📈' },
    ],
  },
  {
    id: 'market',
    name: 'Market & Distribution',
    subtitle: 'Connecting production directly to markets',
    icon: ShoppingBag,
    color: '#6d28d9',
    light: 'rgba(109,40,217,0.07)',
    border: 'rgba(109,40,217,0.2)',
    brands: [
      { id: 'igo-exports',   name: 'IGO Exports',                   icon: '🌍' },
      { id: 'igo-mart',      name: 'IGO Mart',                       icon: '🏪' },
      { id: 'igo-franchise', name: 'IGO Franchise',                  icon: '🤝' },
      { id: 'igo-farmgate',  name: 'IGO Farmgate Buyback Platform',  icon: '♻️' },
    ],
  },
  {
    id: 'sustainability',
    name: 'Sustainability & Lifestyle',
    subtitle: 'Promoting sustainable living',
    icon: Recycle,
    color: '#0e7490',
    light: 'rgba(14,116,144,0.07)',
    border: 'rgba(14,116,144,0.2)',
    brands: [
      { id: 'igo-pharmacy',  name: 'IGO Organic Pharmacy',    icon: '💊' },
      { id: 'igo-cosmetics', name: 'IGO Natural Cosmetics',   icon: '🌸' },
      { id: 'igo-energy',    name: 'IGO Green Energy',        icon: '☀️' },
      { id: 'india-green',   name: 'India Green',             icon: '🌍' },
      { id: 'india-organic', name: 'India Green Organics',    icon: '🥦' },
    ],
  },
  {
    id: 'consumer',
    name: 'Consumer & Experience',
    subtitle: 'Value-added products and experiences',
    icon: Coffee,
    color: '#be123c',
    light: 'rgba(190,18,60,0.07)',
    border: 'rgba(190,18,60,0.2)',
    brands: [
      { id: 'palm-cafe',     name: 'Palm Cafe',     icon: '☕' },
      { id: 'protein-cuts',  name: 'Protein Cuts',  icon: '🥩' },
    ],
  },
  {
    id: 'education',
    name: 'Knowledge & Development',
    subtitle: 'Empowering the next generation',
    icon: GraduationCap,
    color: '#92400e',
    light: 'rgba(146,64,14,0.09)',
    border: 'rgba(146,64,14,0.25)',
    brands: [
      { id: 'igo-academy', name: 'IGO Academy', icon: '🎓' },
    ],
  },
];

const TOTAL_BRANDS = DIVISIONS.reduce((s, d) => s + d.brands.length, 0);

/* ── Component ─────────────────────────────────────────────────────────── */
export default function IgoGroupBrands() {
  const [activeId, setActiveId]   = useState(DIVISIONS[0].id);
  const [visible, setVisible]     = useState(true);
  const navigate                  = useNavigate();
  const division                  = DIVISIONS.find(d => d.id === activeId) || DIVISIONS[0];
  const DivIcon                   = division.icon;

  /* Fade content out/in on tab switch */
  const switchDivision = (id) => {
    if (id === activeId) return;
    setVisible(false);
    setTimeout(() => { setActiveId(id); setVisible(true); }, 200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F7F3' }}>
      <PublicNav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0C2014 0%, #1a3d26 55%, #0f2b1a 100%)',
        padding: '5rem 2rem 6rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Radial glows */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,160,63,0.13) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,106,20,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.4)', fontSize: '.75rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.12em',
              background: 'none', border: 'none', cursor: 'pointer',
              marginBottom: '2rem', transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={14} /> Home
          </button>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ width: 32, height: 1, background: 'rgba(197,160,63,0.6)' }} />
            <span style={{
              color: '#C5A03F', fontSize: '.65rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '.35em',
            }}>The IGO Ecosystem</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 900,
            color: 'white', lineHeight: 1.05, marginBottom: '1.5rem',
            letterSpacing: '-.02em',
          }}>
            Our <span style={{ color: '#C5A03F', fontStyle: 'italic' }}>Brands.</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', fontWeight: 300,
            lineHeight: 1.7, maxWidth: 580,
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)',
            padding: '1.5rem', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '3rem',
          }}>
            Explore our comprehensive network of <strong style={{ color: 'white' }}>{DIVISIONS.length} strategic divisions</strong> and{' '}
            <strong style={{ color: 'white' }}>{TOTAL_BRANDS} specialized brands</strong> driving
            innovation across the agricultural value chain.
          </p>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { num: DIVISIONS.length, label: 'Divisions' },
              { num: TOTAL_BRANDS,    label: 'Brands' },
              { num: '1',             label: 'Ecosystem' },
              { num: 'PAN',           label: 'India' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: '.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRECTORY ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 2rem 5rem', marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── LEFT: Division Tabs ──────────────────────────────────── */}
          <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {DIVISIONS.map((div, idx) => {
              const Icon    = div.icon;
              const isActive = div.id === activeId;
              return (
                <button
                  key={div.id}
                  onClick={() => switchDivision(div.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 14,
                    border: isActive ? `1.5px solid ${div.color}` : '1.5px solid rgba(0,0,0,.07)',
                    background: isActive ? 'white' : 'rgba(255,255,255,0.75)',
                    boxShadow: isActive
                      ? `0 4px 20px ${div.color}22, 0 1px 4px rgba(0,0,0,.06)`
                      : '0 1px 3px rgba(0,0,0,.05)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .18s ease',
                    position: 'relative', overflow: 'hidden',
                    animationDelay: `${idx * 60}ms`,
                  }}
                  className="card-enter"
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.09)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.05)'; } }}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                      background: div.color, borderRadius: '14px 0 0 14px',
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? div.light : 'rgba(0,0,0,.04)',
                    color: isActive ? div.color : 'rgba(0,0,0,.35)',
                    transition: 'all .18s',
                  }}>
                    <Icon size={20} strokeWidth={1.6} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '.88rem', fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#0C2014' : 'rgba(0,0,0,.6)',
                      lineHeight: 1.2, marginBottom: '.2rem',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {div.name}
                    </div>
                    <div style={{
                      fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '.1em', color: isActive ? div.color : 'rgba(0,0,0,.3)',
                    }}>
                      {div.brands.length} Brand{div.brands.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── RIGHT: Division Content ──────────────────────────────── */}
          <div style={{
            flex: '1 1 420px',
            background: 'white',
            borderRadius: 24,
            border: '1px solid rgba(0,0,0,.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,.06)',
            overflow: 'hidden',
            transition: 'opacity .2s ease',
            opacity: visible ? 1 : 0,
          }}>
            {/* Division header */}
            <div style={{
              background: `linear-gradient(135deg, #0C2014 0%, ${division.color}cc 100%)`,
              padding: '2.5rem',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Ghost icon */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                opacity: .06, pointerEvents: 'none',
              }}>
                <DivIcon size={160} strokeWidth={.8} color="white" />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}>
                  <DivIcon size={26} color="white" strokeWidth={1.4} />
                </div>
                <div>
                  <div style={{
                    fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '.3em', color: 'rgba(255,255,255,0.55)', marginBottom: '.4rem',
                  }}>
                    Division {DIVISIONS.findIndex(d => d.id === division.id) + 1} of {DIVISIONS.length}
                  </div>
                  <h2 style={{
                    fontSize: '1.6rem', fontWeight: 900, color: 'white',
                    lineHeight: 1.15, marginBottom: '.4rem',
                  }}>{division.name}</h2>
                  <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
                    {division.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Brand count badge */}
            <div style={{
              padding: '1rem 2.5rem',
              borderBottom: '1px solid rgba(0,0,0,.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#374151' }}>
                {division.brands.length} Brand{division.brands.length !== 1 ? 's' : ''} in this division
              </span>
              <span style={{
                fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.1em', color: division.color,
                background: division.light, padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${division.border}`,
              }}>
                {division.id}
              </span>
            </div>

            {/* Brands grid */}
            <div style={{ padding: '1.75rem 2.5rem 2.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '.85rem',
              }}>
                {division.brands.map((brand, i) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    accentColor={division.color}
                    accentLight={division.light}
                    accentBorder={division.border}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0C2014 0%, #133020 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 250, borderRadius: '50%',
          background: 'rgba(45,106,20,0.3)', filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 1, background: 'rgba(197,160,63,0.5)' }} />
            <span style={{ color: '#C5A03F', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4em' }}>
              IGO Academy
            </span>
            <div style={{ width: 40, height: 1, background: 'rgba(197,160,63,0.5)' }} />
          </div>

          <h2 style={{
            fontSize: 'clamp(1.6rem,4vw,2.6rem)', fontWeight: 900,
            color: 'white', lineHeight: 1.2, marginBottom: '1rem',
          }}>
            Learn from the Ecosystem.<br />
            <span style={{ color: '#C5A03F', fontStyle: 'italic' }}>Grow with Us.</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
            fontWeight: 300, lineHeight: 1.7, marginBottom: '2.5rem',
          }}>
            IGO Academy is the knowledge & development arm of the IGO Group —
            delivering TNSDC + MSME recognised agri-entrepreneurship certification.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/courses')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '.9rem 2rem',
                background: '#C5A03F', color: 'white',
                borderRadius: 50, fontWeight: 800, fontSize: '.85rem',
                textTransform: 'uppercase', letterSpacing: '.1em',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(197,160,63,0.3)',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0C2014'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C5A03F'; e.currentTarget.style.color = 'white'; }}
            >
              Explore Courses <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '.9rem 2rem',
                background: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: 'white', borderRadius: 50, fontWeight: 700,
                fontSize: '.85rem', cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Brand Card ────────────────────────────────────────────────────────── */
function BrandCard({ brand, accentColor, accentLight, accentBorder, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.875rem 1rem',
        borderRadius: 12,
        border: hovered ? `1.5px solid ${accentBorder}` : '1.5px solid rgba(0,0,0,.06)',
        background: hovered ? accentLight : 'rgba(248,250,248,0.6)',
        boxShadow: hovered ? `0 4px 16px ${accentColor}18` : '0 1px 4px rgba(0,0,0,.04)',
        cursor: 'default',
        transition: 'all .18s ease',
        animationDelay: `${index * 50}ms`,
      }}
      className="card-enter"
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: hovered ? accentLight : 'white',
        border: hovered ? `1px solid ${accentBorder}` : '1px solid rgba(0,0,0,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        transition: 'all .18s',
      }}>
        {brand.icon}
      </div>
      <span style={{
        fontSize: '.82rem', fontWeight: hovered ? 700 : 500,
        color: hovered ? '#0C2014' : 'rgba(0,0,0,0.65)',
        lineHeight: 1.35, transition: 'color .15s',
      }}>
        {brand.name}
      </span>
    </div>
  );
}

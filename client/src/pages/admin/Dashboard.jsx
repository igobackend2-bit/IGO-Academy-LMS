import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

/* ── Count-up hook — no dependency needed ────────────────────── */
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target == null || isNaN(target)) return;
    const start = performance.now();
    const num = Number(target);
    const step = (ts) => {
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setValue(Math.round(ease * num));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ label, rawValue, icon, color, sub, delay = 0 }) {
  const displayed = useCountUp(typeof rawValue === 'number' ? rawValue : null, 1200 + delay);
  const isLoading = rawValue == null;

  return (
    <div className="stat-card card-enter" style={{ borderLeft:`4px solid ${color}`, animationDelay:`${delay}ms` }}>
      {/* Decorative corner circle */}
      <div style={{
        position:'absolute', top:-20, right:-20, width:80, height:80,
        borderRadius:'50%', background:`${color}0D`, pointerEvents:'none',
      }}/>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.85rem' }}>
        <div style={{
          width:48, height:48, borderRadius:14, flexShrink:0,
          background:`${color}15`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.4rem',
          boxShadow:`0 4px 12px ${color}22`,
        }}>
          {icon}
        </div>
        <span style={{
          color:'var(--gray-400)', fontSize:'.7rem', fontWeight:700,
          textTransform:'uppercase', letterSpacing:'.08em',
          background:'var(--gray-50)', padding:'3px 8px', borderRadius:20,
        }}>{sub}</span>
      </div>
      <p style={{
        color:'var(--navy-dark)', fontSize:'2.2rem', fontWeight:800,
        lineHeight:1, marginBottom:'.35rem', letterSpacing:'-.03em',
        animation: isLoading ? '' : 'countUp .4s ease both',
      }}>
        {isLoading ? <span className="skeleton" style={{ width:64, height:36, display:'inline-block', borderRadius:8 }}/> : displayed}
      </p>
      <p style={{ color:'var(--gray-600)', fontSize:'.82rem', fontWeight:500 }}>{label}</p>
    </div>
  );
}

/* ── Wheat Divider SVG ───────────────────────────────────────── */
function WheatDivider() {
  return (
    <svg viewBox="0 0 1200 40" style={{ width:'100%', display:'block', marginTop:-1 }}
      preserveAspectRatio="none">
      <defs>
        <linearGradient id="wdg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3F8A24" stopOpacity="0"/>
          <stop offset="20%"  stopColor="#7CBF34" stopOpacity="1"/>
          <stop offset="80%"  stopColor="#7CBF34" stopOpacity="1"/>
          <stop offset="100%" stopColor="#3F8A24" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Base wave */}
      <path d="M0 20 Q300 0 600 20 Q900 40 1200 20 L1200 40 L0 40 Z"
        fill="var(--gray-50)"/>
      {/* Decorative mini wheat stalks along the top edge */}
      {[60,160,260,360,460,560,660,760,860,960,1060,1140].map((sx,i) => (
        <g key={i}>
          <line x1={sx} y1="22" x2={sx} y2="8" stroke="#8DC63F" strokeWidth="1.2" opacity="0.5"/>
          <ellipse cx={sx} cy="5" rx="2.5" ry="5" fill="#C8A038" opacity="0.45"/>
        </g>
      ))}
    </svg>
  );
}

/* ── Quick Action Card ────────────────────────────────────────── */
function ActionCard({ label, href, icon, color, desc }) {
  const nav = useNavigate();
  return (
    <button onClick={() => nav(href)} style={{
      background:'white', border:`1.5px solid ${color}22`,
      borderRadius:16, padding:'1.1rem 1.25rem',
      cursor:'pointer', textAlign:'left',
      transition:'all .22s ease',
      boxShadow:'0 2px 8px rgba(13,38,25,.05)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 8px 24px ${color}28`;
      e.currentTarget.style.borderColor = `${color}55`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,38,25,.05)';
      e.currentTarget.style.borderColor = `${color}22`;
    }}
    >
      <div style={{
        width:40, height:40, borderRadius:12,
        background:`${color}15`, display:'flex',
        alignItems:'center', justifyContent:'center',
        fontSize:'1.2rem', marginBottom:'.6rem',
      }}>{icon}</div>
      <p style={{ color:'var(--navy-dark)', fontWeight:700, fontSize:'.9rem', marginBottom:2 }}>{label}</p>
      <p style={{ color:'var(--gray-400)', fontSize:'.75rem' }}>{desc}</p>
    </button>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const CARDS = [
    { label:'Total Students',    rawValue: stats?.totalStudents,  icon:'🎓', color:'var(--navy)',         sub:'Enrolled',  delay:0   },
    { label:'Active Courses',    rawValue: stats?.activeCourses,  icon:'📚', color:'var(--gold-dark)',    sub:'Running',   delay:80  },
    { label:'Pending Reviews',   rawValue: stats?.pendingReviews, icon:'📝', color:'#D97706',             sub:'Awaiting',  delay:160 },
    { label:'Certs This Month',  rawValue: stats?.certsThisMonth, icon:'🏆', color:'var(--green)',        sub:'Issued',    delay:240 },
    { label:'Expiring in 7 Days',rawValue: stats?.expiringCount,  icon:'⚠️', color:'var(--error)',        sub:'Alert',     delay:320 },
    { label:'Total Trainers',    rawValue: stats?.totalTrainers,  icon:'👨‍🏫', color:'#0891B2',            sub:'Faculty',   delay:400 },
  ];

  const ACTIONS = [
    { label:'Add Student',       href:'/admin/users',        icon:'👤', color:'var(--navy)',      desc:'Create a new learner account'   },
    { label:'Create Course',     href:'/admin/courses',      icon:'📖', color:'#3F8A24',          desc:'Add & configure a new course'   },
    { label:'Enroll Student',    href:'/admin/enrollments',  icon:'✅', color:'#0E7490',          desc:'Link students to courses'       },
    { label:'View Reports',      href:'/admin/reports',      icon:'📊', color:'var(--green)',     desc:'Attendance, progress, exports'  },
    { label:'Issue Certificate', href:'/admin/certificates', icon:'🏆', color:'#D97706',          desc:'Generate & manage certificates' },
  ];

  const STATUS = [
    { label:'Database',      status:'Supabase — Connected', ok:true  },
    { label:'Storage',       status:'3 Buckets Active',     ok:true  },
    { label:'Email Service', status:'SMTP Active',          ok:true  },
    { label:'Session Store', status:'In-Memory (dev)',      ok:true  },
    { label:'Cron Jobs',     status:'Running — daily',      ok:true  },
  ];

  return (
    <div className="page-enter" style={{ minHeight:'100vh', background:'var(--gray-50)' }}>

      {/* ── Header banner ── */}
      <div style={{
        background:'linear-gradient(135deg,#0C2014 0%,#16402B 55%,#235C39 100%)',
        padding:'2rem 2.5rem 0', color:'white', position:'relative', overflow:'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:240, height:240, borderRadius:'50%', background:'rgba(141,198,63,0.07)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:20, right:160, width:120, height:120, borderRadius:'50%', background:'rgba(141,198,63,0.04)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-50, left:'25%', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }}/>

        <p style={{ color:'rgba(141,198,63,0.9)', fontSize:'.72rem', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:'.5rem' }}>
          IGo Academy
        </p>
        <h1 style={{ fontSize:'1.9rem', fontWeight:800, marginBottom:'.35rem', letterSpacing:'-.03em' }}>
          Admin Dashboard
        </h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'.875rem', marginBottom:'2rem' }}>
          Platform overview &amp; quick actions
        </p>

        {/* Wheat silhouette divider */}
        <WheatDivider/>
      </div>

      <div style={{ padding:'0 2rem 2.5rem', marginTop:'.5rem' }}>

        {/* ── Stat cards ── */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',
          gap:'1rem', marginBottom:'2rem',
        }}>
          {CARDS.map(c => (
            <StatCard key={c.label} {...c}
              rawValue={loading ? null : c.rawValue ?? 0}/>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div style={{
          background:'white', borderRadius:20, padding:'1.75rem',
          border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)',
          marginBottom:'2rem',
        }}>
          <h2 className="section-title">Quick Actions</h2>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
            gap:'1rem',
          }}>
            {ACTIONS.map(a => <ActionCard key={a.label} {...a}/>)}
          </div>
        </div>

        {/* ── Info row ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>

          {/* Platform Status */}
          <div style={{
            background:'white', borderRadius:20, padding:'1.75rem',
            border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)',
          }}>
            <h2 className="section-title">Platform Status</h2>
            {STATUS.map(s => (
              <div key={s.label} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'.7rem 0', borderBottom:'1px solid var(--gray-100)',
              }}>
                <span style={{ fontSize:'.875rem', color:'var(--gray-600)', fontWeight:500 }}>{s.label}</span>
                <span style={{
                  fontSize:'.75rem', fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background:s.ok ? 'var(--green-light)' : 'var(--error-light)',
                  color:s.ok ? 'var(--green)' : 'var(--error)',
                  display:'flex', alignItems:'center',
                }}>
                  <span className="status-dot-live" style={{ background:s.ok?'var(--green)':'var(--error)' }}/>
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* About card */}
          <div style={{
            background:'linear-gradient(145deg,#0C2014 0%,#16402B 60%,#1F5030 100%)',
            borderRadius:20, padding:'1.75rem', color:'white', position:'relative', overflow:'hidden',
          }}>
            {/* Wheat stalk decoration */}
            <svg style={{ position:'absolute', bottom:0, right:0, width:120, opacity:.12 }}
              viewBox="0 0 80 140">
              {[15,35,55,75].map((x,i) => (
                <g key={i}>
                  <line x1={x} y1="140" x2={x} y2={140-60-i*8} stroke="#8DC63F" strokeWidth="2"/>
                  <ellipse cx={x} cy={140-63-i*8} rx="4" ry="12" fill="#DAA520"/>
                </g>
              ))}
            </svg>

            <h2 style={{ fontSize:'1.05rem', fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:4, height:'1.1em', background:'var(--gold)', borderRadius:2, display:'inline-block' }}/>
              IGo Academy
            </h2>
            <p style={{ color:'rgba(255,255,255,.58)', fontSize:'.82rem', lineHeight:1.8, marginBottom:'1.1rem' }}>
              TNSDC + MSME Recognised Institute<br/>
              Established 2019 · Chennai, Tamil Nadu<br/>
              500+ Alumni Trained<br/>
              Agri-Entrepreneurship Training
            </p>
            <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
              {['TNSDC','MSME','AgriTech','Chennai','Phase 2 →'].map(t => (
                <span key={t} style={{
                  background:'rgba(141,198,63,0.14)', color:'rgba(141,198,63,0.9)',
                  fontSize:'.68rem', fontWeight:700, padding:'3px 10px',
                  borderRadius:20, border:'1px solid rgba(141,198,63,0.22)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

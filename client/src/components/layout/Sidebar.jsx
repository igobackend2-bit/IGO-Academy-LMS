import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/* ── Inline SVG Icons (no icon library needed) ─────────────────
   Each returns a 20×20 SVG icon.                               */
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Courses: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  Enrollments: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 14l2 2 4-4"/>
    </svg>
  ),
  Assessments: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Certificates: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Reports: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Grading: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  MyCourses: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Explore: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  SignOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Information: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Notes: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9"  x2="8"  y2="9"/>
    </svg>
  ),
  Resources: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
};

/* ── Nav link definitions ─────────────────────────────────────── */
const adminLinks = [
  { to:'/admin/dashboard',    label:'Dashboard',    Icon:Icons.Dashboard    },
  { to:'/admin/users',        label:'Users',        Icon:Icons.Users        },
  { to:'/admin/courses',      label:'Courses',      Icon:Icons.Courses      },
  { to:'/admin/enrollments',  label:'Enrollments',  Icon:Icons.Enrollments  },
  { to:'/admin/assessments',  label:'Assessments',  Icon:Icons.Assessments  },
  { to:'/admin/certificates', label:'Certificates', Icon:Icons.Certificates },
  { to:'/admin/reports',      label:'Reports',      Icon:Icons.Reports      },
  { to:'/admin/resources',    label:'Resources',    Icon:Icons.Resources    },
];
const studentLinks = [
  { to:'/student/dashboard',    label:'My Courses',      Icon:Icons.MyCourses    },
  { to:'/student/explore',      label:'Explore Courses', Icon:Icons.Explore      },
  { to:'/student/assessments',  label:'Assessments',     Icon:Icons.Assessments  },
  { to:'/student/certificates', label:'Certificates',    Icon:Icons.Certificates },
  { to:'/student/information',  label:'Information',     Icon:Icons.Information  },
  { to:'/student/notes',        label:'Notes',           Icon:Icons.Notes        },
];
const trainerLinks = [
  { to:'/trainer/dashboard', label:'Dashboard', Icon:Icons.Dashboard },
  { to:'/trainer/grading',   label:'Grading',   Icon:Icons.Grading   },
];

/* ── Avatar initials ─────────────────────────────────────────── */
function Avatar({ name, color }) {
  const initials = (name || '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';
  return (
    <div style={{
      width:38, height:38, borderRadius:12, flexShrink:0,
      background:color, color:'white',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight:800, fontSize:'.8rem', fontFamily:'Sora,sans-serif',
      boxShadow:`0 2px 8px ${color}55`,
    }}>{initials}</div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────── */
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links    = user?.role === 'admin' ? adminLinks : user?.role === 'trainer' ? trainerLinks : studentLinks;
  const roleLbl  = user?.role === 'admin' ? 'Administrator' : user?.role === 'trainer' ? 'Trainer' : 'Student';
  const roleColor= user?.role === 'admin' ? '#8DC63F' : user?.role === 'trainer' ? '#3F8A24' : '#235C39';

  return (
    <aside style={{
      width:256, minHeight:'100vh', flexShrink:0,
      background:'linear-gradient(180deg,#0C2014 0%,#152E1C 40%,#0C2014 100%)',
      display:'flex', flexDirection:'column',
      boxShadow:'4px 0 28px rgba(7,20,12,.3)',
      position:'sticky', top:0,
    }}>

      {/* ── Logo ── */}
      <div style={{ padding:'1.25rem 1.25rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          background:'white', borderRadius:14, padding:'.6rem .9rem',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 18px rgba(0,0,0,.28)',
          cursor:'pointer', transition:'transform .2s ease',
        }}
        onClick={() => navigate(`/${user?.role}/dashboard`)}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          <img src="/igo-logo.png" alt="IGo Academy"
            style={{ height:52, display:'block', margin:'0 auto' }}/>
        </div>
        <p style={{
          color:'rgba(141,198,63,0.8)', fontSize:'.62rem', fontWeight:700,
          letterSpacing:'.16em', textTransform:'uppercase',
          textAlign:'center', marginTop:'.65rem',
        }}>Grow · Learn · Lead</p>
      </div>

      {/* ── Role badge ── */}
      <div style={{ padding:'.85rem 1.25rem .4rem' }}>
        <div style={{
          background:'rgba(255,255,255,0.05)', borderRadius:10,
          padding:'.4rem .85rem', display:'inline-flex',
          alignItems:'center', gap:6,
          border:'1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            width:6, height:6, borderRadius:'50%',
            background:roleColor, display:'inline-block',
            boxShadow:`0 0 6px ${roleColor}`,
          }}/>
          <span style={{
            color:'rgba(255,255,255,0.5)', fontSize:'.68rem',
            fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
          }}>
            {roleLbl} Panel
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex:1, padding:'.4rem .75rem', overflowY:'auto' }}>
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10,
              padding:'.62rem .9rem', borderRadius:11,
              fontSize:'.865rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0C2014' : 'rgba(255,255,255,0.65)',
              background: isActive
                ? 'linear-gradient(135deg,#8DC63F 0%,#4FA02E 100%)'
                : 'transparent',
              textDecoration:'none', marginBottom:2,
              transition:'all .18s ease',
              boxShadow: isActive ? '0 4px 14px rgba(141,198,63,0.38)' : 'none',
              // Left accent bar
              borderLeft: isActive ? '3px solid rgba(255,255,255,0.55)' : '3px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ opacity: isActive ? 1 : 0.75, flexShrink:0 }}>
                  <Icon/>
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Decorative wheat stems at bottom of nav ── */}
      <div style={{ padding:'0 1.25rem', opacity:.18, pointerEvents:'none' }}>
        <svg viewBox="0 0 204 36" style={{ width:'100%', display:'block' }}>
          {[12,36,60,84,108,132,156,180,204].map((x,i) => (
            <g key={i}>
              <line x1={x} y1="36" x2={x} y2={36-20-i%3*4}
                stroke="#8DC63F" strokeWidth="1.5"/>
              <ellipse cx={x} cy={36-23-i%3*4} rx="2.5" ry="7"
                fill="#DAA520" opacity=".8"/>
            </g>
          ))}
        </svg>
      </div>

      {/* ── User + Sign Out ── */}
      <div style={{ padding:'1rem 1rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          background:'rgba(255,255,255,0.06)', borderRadius:14,
          padding:'.8rem 1rem', marginBottom:'.75rem',
          display:'flex', alignItems:'center', gap:10,
          border:'1px solid rgba(255,255,255,0.08)',
        }}>
          <Avatar name={user?.full_name} color={roleColor}/>
          <div style={{ minWidth:0 }}>
            <p style={{
              color:'white', fontSize:'.82rem', fontWeight:700,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{user?.full_name}</p>
            <p style={{
              color:'rgba(255,255,255,0.4)', fontSize:'.68rem',
              textTransform:'capitalize', marginTop:1,
            }}>{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width:'100%',
            background:'rgba(220,38,38,0.10)',
            border:'1px solid rgba(220,38,38,0.22)',
            color:'#FCA5A5', borderRadius:11,
            padding:'.58rem', fontSize:'.82rem', fontWeight:600,
            cursor:'pointer', transition:'all .18s ease',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.22)'; e.currentTarget.style.color='#FEE2E2' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(220,38,38,0.10)'; e.currentTarget.style.color='#FCA5A5' }}
        >
          <Icons.SignOut/>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

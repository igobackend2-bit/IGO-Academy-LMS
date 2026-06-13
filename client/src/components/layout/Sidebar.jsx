import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard',    label: 'Dashboard',    icon: '⚡' },
  { to: '/admin/users',        label: 'Users',        icon: '👥' },
  { to: '/admin/courses',      label: 'Courses',      icon: '📚' },
  { to: '/admin/enrollments',  label: 'Enrollments',  icon: '📋' },
  { to: '/admin/assessments',  label: 'Assessments',  icon: '📝' },
  { to: '/admin/certificates', label: 'Certificates', icon: '🏆' },
  { to: '/admin/reports',      label: 'Reports',      icon: '📊' },
];
const studentLinks = [
  { to: '/student/dashboard',    label: 'My Courses',     icon: '📚' },
  { to: '/student/assessments',  label: 'Assessments',    icon: '📝' },
  { to: '/student/certificates', label: 'Certificates',   icon: '🏆' },
];
const trainerLinks = [
  { to: '/trainer/dashboard', label: 'Dashboard', icon: '⚡' },
  { to: '/trainer/grading',   label: 'Grading',   icon: '✏️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'trainer' ? trainerLinks : studentLinks;

  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'trainer' ? 'Trainer' : 'Student';
  const roleBg    = user?.role === 'admin' ? '#8DC63F' : user?.role === 'trainer' ? '#3F8A24' : '#235C39';

  return (
    <aside style={{
      width:'256px', minHeight:'100vh', flexShrink:0,
      background:'linear-gradient(180deg,#0C2014 0%,#16402B 50%,#0C2014 100%)',
      display:'flex', flexDirection:'column',
      boxShadow:'4px 0 24px rgba(7,20,12,0.25)',
      position:'sticky', top:0,
    }}>
      {/* Logo — white chip so the brand wordmark reads on the dark sidebar */}
      <div style={{padding:'1.25rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{background:'white',borderRadius:'14px',padding:'.6rem .9rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,0,0,0.25)'}}>
          <img src="/igo-logo.png" alt="IGo Academy" style={{height:'56px',display:'block',margin:'0 auto'}} />
        </div>
        <p style={{color:'rgba(141,198,63,0.85)',fontSize:'.66rem',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textAlign:'center',marginTop:'.6rem'}}>Grow · Learn · Lead</p>
      </div>

      {/* Role badge */}
      <div style={{padding:'1rem 1.5rem .5rem'}}>
        <span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.55)',fontSize:'.68rem',fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',padding:'4px 10px',borderRadius:'20px'}}>
          {roleLabel} Panel
        </span>
      </div>

      {/* Nav Links */}
      <nav style={{flex:1,padding:'.5rem .75rem',overflowY:'auto'}}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            style={({isActive}) => ({
              display:'flex', alignItems:'center', gap:'10px',
              padding:'.65rem .9rem', borderRadius:'10px',
              fontSize:'.875rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0C2014' : 'rgba(255,255,255,0.7)',
              background: isActive ? 'linear-gradient(135deg,#8DC63F 0%,#4FA02E 100%)' : 'transparent',
              textDecoration:'none', marginBottom:'2px',
              transition:'all .15s ease',
              boxShadow: isActive ? '0 4px 12px rgba(141,198,63,0.35)' : 'none',
            })}
          >
            <span style={{fontSize:'1rem',width:'20px',textAlign:'center'}}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{padding:'1rem',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'12px',padding:'.85rem 1rem',marginBottom:'.75rem',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{
            width:'52px',height:'36px',borderRadius:'10px',flexShrink:0,
            background:'white',padding:'3px 5px',
            display:'flex',alignItems:'center',justifyContent:'center',
            border:`2px solid ${roleBg}`,
          }}>
            <img src="/igo-logo.png" alt="IGo" style={{maxHeight:'100%',maxWidth:'100%',objectFit:'contain'}} />
          </div>
          <div style={{minWidth:0}}>
            <p style={{color:'white',fontSize:'.82rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.full_name}</p>
            <p style={{color:'rgba(255,255,255,0.45)',fontSize:'.7rem',textTransform:'capitalize'}}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{width:'100%',background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.25)',color:'#FCA5A5',borderRadius:'10px',padding:'.6rem',fontSize:'.82rem',fontWeight:600,cursor:'pointer',transition:'all .15s ease'}}
          onMouseEnter={e=>{e.target.style.background='rgba(220,38,38,0.25)';e.target.style.color='#FEE2E2'}}
          onMouseLeave={e=>{e.target.style.background='rgba(220,38,38,0.12)';e.target.style.color='#FCA5A5'}}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

import { useEffect, useState } from 'react';
import api from '@/services/api';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background:'white', borderRadius:'18px', padding:'1.5rem',
    border:`1px solid var(--gray-200)`, borderLeft:`4px solid ${color}`,
    boxShadow:'0 2px 12px rgba(13,38,25,.06)',
    transition:'all .2s ease', cursor:'default',
  }}
  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
  >
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'.75rem'}}>
      <div style={{width:'48px',height:'48px',borderRadius:'12px',background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>
        {icon}
      </div>
      <span style={{color:'var(--gray-400)',fontSize:'.75rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>{sub}</span>
    </div>
    <p style={{color:'var(--navy)',fontSize:'2rem',fontWeight:800,lineHeight:1,marginBottom:'.35rem'}}>{value ?? '—'}</p>
    <p style={{color:'var(--gray-600)',fontSize:'.82rem',fontWeight:500}}>{label}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'var(--gray-50)'}}>
      {/* Top banner */}
      <div style={{
        background:'linear-gradient(135deg,#0C2014 0%,#16402B 60%,#235C39 100%)',
        padding:'2rem 2.5rem 3.5rem',color:'white',position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'200px',height:'200px',borderRadius:'50%',background:'rgba(141,198,63,0.08)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:'-40px',left:'30%',width:'150px',height:'150px',borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none'}} />
        <p style={{color:'rgba(141,198,63,0.9)',fontSize:'.75rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'.5rem'}}>IGo Academy</p>
        <h1 style={{fontSize:'1.75rem',fontWeight:800,marginBottom:'.35rem',letterSpacing:'-.02em'}}>Admin Dashboard</h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:'.875rem'}}>Platform overview &amp; quick actions</p>
      </div>

      <div style={{padding:'0 2rem 2rem',marginTop:'-1.5rem'}}>
        {/* Stat Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          <StatCard label="Total Students"    value={loading ? '…' : stats?.totalStudents}   icon="🎓" color="var(--navy)"  sub="Enrolled" />
          <StatCard label="Active Courses"    value={loading ? '…' : stats?.activeCourses}   icon="📚" color="var(--gold)"  sub="Running"  />
          <StatCard label="Pending Reviews"   value={loading ? '…' : stats?.pendingReviews}  icon="📝" color="#D97706"      sub="Awaiting" />
          <StatCard label="Certs This Month"  value={loading ? '…' : stats?.certsThisMonth}  icon="🏆" color="var(--green)" sub="Issued"   />
          <StatCard label="Expiring in 7 Days"value={loading ? '…' : stats?.expiringCount}   icon="⚠️" color="var(--error)" sub="Alert"    />
          <StatCard label="Total Trainers"    value={loading ? '…' : stats?.totalTrainers}   icon="👨‍🏫" color="#0891B2"     sub="Faculty"  />
        </div>

        {/* Quick Actions */}
        <div style={{background:'white',borderRadius:'18px',padding:'1.75rem',border:'1px solid var(--gray-200)',boxShadow:'0 2px 12px rgba(13,38,25,.06)',marginBottom:'2rem'}}>
          <h2 className="section-title">Quick Actions</h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:'.75rem'}}>
            {[
              { label:'Add Student',       href:'/admin/users',       color:'var(--navy)' },
              { label:'Create Course',     href:'/admin/courses',     color:'var(--gold-dark)' },
              { label:'Enroll Student',    href:'/admin/enrollments', color:'#0E7490' },
              { label:'View Reports',      href:'/admin/reports',     color:'var(--green)' },
              { label:'Issue Certificate', href:'/admin/certificates',color:'#0891B2' },
            ].map(a => (
              <a key={a.href} href={a.href} style={{
                display:'inline-flex',alignItems:'center',gap:'6px',
                background:`${a.color}12`,color:a.color,border:`1.5px solid ${a.color}30`,
                borderRadius:'10px',padding:'.55rem 1.1rem',fontSize:'.82rem',fontWeight:600,
                textDecoration:'none',transition:'all .15s ease',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}22`}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${a.color}12`}}
              >
                {a.label} →
              </a>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
          <div style={{background:'white',borderRadius:'18px',padding:'1.75rem',border:'1px solid var(--gray-200)',boxShadow:'0 2px 12px rgba(13,38,25,.06)'}}>
            <h2 className="section-title">Platform Status</h2>
            {[
              { label:'Database',       status:'Connected',  ok:true  },
              { label:'Storage',        status:'Supabase',   ok:true  },
              { label:'Email Service',  status:'Active',     ok:true  },
              { label:'Session Store',  status:'Upstash',    ok:true  },
              { label:'Cron Jobs',      status:'Running',    ok:true  },
            ].map(s => (
              <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.65rem 0',borderBottom:'1px solid var(--gray-100)'}}>
                <span style={{fontSize:'.875rem',color:'var(--gray-600)',fontWeight:500}}>{s.label}</span>
                <span style={{fontSize:'.75rem',fontWeight:600,padding:'2px 10px',borderRadius:'20px',background:s.ok?'var(--green-light)':'var(--error-light)',color:s.ok?'var(--green)':'var(--error)'}}>
                  ● {s.status}
                </span>
              </div>
            ))}
          </div>

          <div style={{background:'linear-gradient(135deg,#0C2014 0%,#16402B 100%)',borderRadius:'18px',padding:'1.75rem',color:'white'}}>
            <h2 style={{fontSize:'1.05rem',fontWeight:700,marginBottom:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{width:'4px',height:'1.1em',background:'var(--gold)',borderRadius:'2px',display:'inline-block'}} />
              IGo Academy
            </h2>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:'.82rem',lineHeight:1.7,marginBottom:'1rem'}}>
              TNSDC + MSME Recognised Institute<br/>
              Established 2019 · Chennai, Tamil Nadu<br/>
              500+ Alumni Trained<br/>
              Agri-Entrepreneurship Training
            </p>
            <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
              {['TNSDC','MSME','AgriTech','Chennai'].map(t=>(
                <span key={t} style={{background:'rgba(141,198,63,0.15)',color:'rgba(141,198,63,0.9)',fontSize:'.7rem',fontWeight:600,padding:'3px 10px',borderRadius:'20px',border:'1px solid rgba(141,198,63,0.25)'}}>
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

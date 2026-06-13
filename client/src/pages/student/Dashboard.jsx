import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import dayjs from 'dayjs';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my')
      .then(r => setEnrollments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = (end) => dayjs(end).diff(dayjs(), 'day');

  return (
    <div style={{minHeight:'100vh',background:'var(--gray-50)'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0C2014 0%,#16402B 60%,#235C39 100%)',padding:'2rem 2.5rem 3.5rem',color:'white',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'200px',height:'200px',borderRadius:'50%',background:'rgba(141,198,63,0.08)',pointerEvents:'none'}} />
        <p style={{color:'rgba(141,198,63,0.9)',fontSize:'.75rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'.4rem'}}>Welcome back</p>
        <h1 style={{fontSize:'1.75rem',fontWeight:800,marginBottom:'.35rem',letterSpacing:'-.02em'}}>
          {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:'.875rem'}}>Continue your agri-entrepreneurship journey</p>
      </div>

      <div style={{padding:'0 2rem 2rem',marginTop:'-1.5rem'}}>
        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          {[
            { label:'Enrolled Courses', value: enrollments.length, icon:'📚', color:'var(--navy)' },
            { label:'Completed',        value: enrollments.filter(e=>e.completed).length, icon:'✅', color:'var(--green)' },
            { label:'Certificates',     value: enrollments.filter(e=>e.certificate_issued).length, icon:'🏆', color:'var(--gold-dark)' },
          ].map(s=>(
            <div key={s.label} style={{background:'white',borderRadius:'16px',padding:'1.25rem',border:'1px solid var(--gray-200)',borderLeft:`4px solid ${s.color}`,boxShadow:'0 2px 12px rgba(13,38,25,.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'1.4rem'}}>{s.icon}</span>
                <div>
                  <p style={{color:'var(--navy)',fontSize:'1.5rem',fontWeight:800,lineHeight:1}}>{loading ? '…' : s.value}</p>
                  <p style={{color:'var(--gray-400)',fontSize:'.75rem',fontWeight:500}}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course cards */}
        <h2 className="section-title">My Courses</h2>
        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem'}}>
            {[1,2].map(i=><div key={i} className="skeleton" style={{height:'200px',borderRadius:'16px'}} />)}
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{background:'white',borderRadius:'18px',padding:'3rem',textAlign:'center',border:'1px solid var(--gray-200)'}}>
            <p style={{fontSize:'2.5rem',marginBottom:'1rem'}}>📚</p>
            <p style={{color:'var(--navy)',fontWeight:700,fontSize:'1.05rem',marginBottom:'.5rem'}}>No courses yet</p>
            <p style={{color:'var(--gray-400)',fontSize:'.875rem'}}>Contact IGo Academy to get enrolled in a course.</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem'}}>
            {enrollments.map(en => {
              const days = daysLeft(en.end_date);
              const expiring = days <= 7 && days >= 0;
              const expired  = days < 0;
              return (
                <div key={en.id} style={{background:'white',borderRadius:'18px',border:'1px solid var(--gray-200)',boxShadow:'0 2px 12px rgba(13,38,25,.06)',overflow:'hidden',transition:'all .2s ease'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>

                  {/* Card header */}
                  <div style={{background:'linear-gradient(135deg,#0C2014,#235C39)',padding:'1.25rem',position:'relative'}}>
                    {expiring && !expired && (
                      <div style={{position:'absolute',top:'12px',right:'12px',background:'rgba(141,198,63,0.9)',color:'#0C2014',fontSize:'.68rem',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>
                        ⚠ {days}d left
                      </div>
                    )}
                    {expired && (
                      <div style={{position:'absolute',top:'12px',right:'12px',background:'rgba(220,38,38,0.9)',color:'white',fontSize:'.68rem',fontWeight:700,padding:'3px 8px',borderRadius:'20px'}}>
                        Expired
                      </div>
                    )}
                    <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(141,198,63,0.2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'.75rem'}}>
                      <span style={{fontSize:'1.3rem'}}>🌱</span>
                    </div>
                    <h3 style={{color:'white',fontWeight:700,fontSize:'1rem',marginBottom:'.25rem'}}>{en.course?.title}</h3>
                    <p style={{color:'rgba(255,255,255,0.55)',fontSize:'.75rem'}}>by {en.trainer?.full_name || 'IGo Faculty'}</p>
                  </div>

                  {/* Card body */}
                  <div style={{padding:'1.25rem'}}>
                    <div style={{marginBottom:'1rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.4rem'}}>
                        <span style={{fontSize:'.75rem',color:'var(--gray-400)',fontWeight:500}}>Progress</span>
                        <span style={{fontSize:'.75rem',color:'var(--navy)',fontWeight:700}}>{en.progress || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width:`${en.progress || 0}%`}} />
                      </div>
                    </div>

                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                      <span style={{fontSize:'.75rem',color:'var(--gray-400)'}}>Expires: <strong style={{color:'var(--gray-600)'}}>{dayjs(en.end_date).format('DD MMM YYYY')}</strong></span>
                      <span style={{fontSize:'.75rem',color:'var(--gray-400)'}}>{en.course?.duration_hours}h course</span>
                    </div>

                    <Link
                      to={expired ? '/course-expired' : `/student/course/${en.course_id}`}
                      style={{
                        display:'block',textAlign:'center',textDecoration:'none',
                        background: expired ? 'var(--gray-100)' : 'linear-gradient(135deg,var(--navy),#235C39)',
                        color: expired ? 'var(--gray-400)' : 'white',
                        borderRadius:'10px',padding:'.65rem',fontSize:'.85rem',fontWeight:600,
                        transition:'all .15s ease',
                      }}
                    >
                      {expired ? 'Access Ended' : 'Continue Learning →'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

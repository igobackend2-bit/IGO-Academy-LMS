import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function CourseExpiredPage() {
  const { logout } = useAuth();
  return (
    <div style={{minHeight:'100vh',background:'#F5F9F6',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div style={{background:'white',borderRadius:'26px',padding:'3rem 2.5rem',maxWidth:'440px',width:'100%',textAlign:'center',border:'1px solid #DDE8DF',boxShadow:'0 18px 48px rgba(13,38,25,0.1)'}}>
        <div style={{width:'80px',height:'80px',borderRadius:'20px',background:'var(--error-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2.5rem'}}>⏰</div>
        <h1 style={{color:'var(--navy)',fontWeight:800,fontSize:'1.4rem',marginBottom:'.75rem'}}>Course Access Ended</h1>
        <p style={{color:'var(--gray-600)',fontSize:'.9rem',lineHeight:1.7,marginBottom:'2rem'}}>
          Your course access period has expired. To continue learning, please contact IGo Academy to renew your enrollment.
        </p>
        <div style={{background:'var(--navy-light)',borderRadius:'12px',padding:'1rem',marginBottom:'2rem'}}>
          <p style={{color:'var(--navy)',fontSize:'.82rem',fontWeight:600}}>📧 igotnskills@gmail.com</p>
          <p style={{color:'var(--navy)',fontSize:'.82rem',fontWeight:600,marginTop:'.25rem'}}>🌐 igoacademy.in</p>
        </div>
        <button onClick={logout} className="btn-primary" style={{borderRadius:'12px',padding:'.8rem 2rem'}}>Sign Out</button>
      </div>
    </div>
  );
}

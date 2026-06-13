import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0C2014 0%,#16402B 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div style={{background:'white',borderRadius:'24px',padding:'3rem 2.5rem',maxWidth:'420px',width:'100%',textAlign:'center',boxShadow:'0 24px 64px rgba(7,20,12,0.35)'}}>
        <p style={{fontSize:'4rem',fontWeight:900,color:'var(--navy)',marginBottom:'.5rem'}}>404</p>
        <h1 style={{color:'var(--navy)',fontWeight:700,fontSize:'1.2rem',marginBottom:'.75rem'}}>Page Not Found</h1>
        <p style={{color:'var(--gray-400)',fontSize:'.875rem',marginBottom:'2rem'}}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary" style={{textDecoration:'none',borderRadius:'12px',padding:'.8rem 2rem',display:'inline-flex'}}>Go Home</Link>
      </div>
    </div>
  );
}

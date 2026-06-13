import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(
        result.error === 'COURSE_EXPIRED'      ? 'Your course access has ended. Contact IGo Academy.' :
        result.error === 'UNAUTHORIZED'        ? 'Your account has been deactivated.' :
        result.error === 'TOO_MANY_REQUESTS'   ? 'Too many login attempts. Please wait a few minutes and try again.' :
        'Invalid email or password. Please try again.'
      );
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F9F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Soft green atmosphere */}
      <div style={{position:'absolute',top:'-180px',right:'-140px',width:'520px',height:'520px',borderRadius:'50%',background:'radial-gradient(circle,rgba(141,198,63,0.18) 0%,rgba(141,198,63,0) 70%)',pointerEvents:'none'}} />
      <div style={{position:'absolute',bottom:'-160px',left:'-120px',width:'460px',height:'460px',borderRadius:'50%',background:'radial-gradient(circle,rgba(79,160,46,0.12) 0%,rgba(79,160,46,0) 70%)',pointerEvents:'none'}} />
      <div style={{position:'absolute',top:'18%',left:'12%',width:'14px',height:'14px',borderRadius:'50%',background:'#D6EBB5',pointerEvents:'none'}} />
      <div style={{position:'absolute',bottom:'24%',right:'14%',width:'10px',height:'10px',borderRadius:'50%',background:'#B5DB7A',pointerEvents:'none'}} />

      <div style={{width:'100%',maxWidth:'430px',position:'relative',zIndex:1}} className="fade-in">

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <img src="/igo-logo.png" alt="IGo Academy" style={{height:'130px',margin:'0 auto .25rem'}} />
          <p style={{color:'#3F8A24',fontSize:'.78rem',fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase'}}>Grow · Learn · Lead</p>
        </div>

        {/* Card */}
        <div style={{
          background:'white',
          borderRadius:'26px',
          padding:'2.25rem',
          border:'1px solid #DDE8DF',
          boxShadow:'0 18px 48px rgba(13,38,25,0.1)',
        }}>
          <h2 style={{color:'#0C2014',fontWeight:700,fontSize:'1.2rem',marginBottom:'.35rem'}}>Welcome back</h2>
          <p style={{color:'var(--gray-400)',fontSize:'.85rem',marginBottom:'1.75rem'}}>Sign in to your IGo Academy account</p>

          {error && (
            <div className="alert-error" style={{marginBottom:'1.25rem'}}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="igo-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{position:'relative'}}>
              <label className="form-label">Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                className="igo-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{paddingRight:'3rem'}}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{position:'absolute',right:'12px',top:'calc(50% + 8px)',background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)',fontSize:'.75rem',fontWeight:700}}
              >
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div style={{textAlign:'right',marginBottom:'1.5rem',marginTop:'-0.5rem'}}>
              <Link to="/forgot-password" style={{color:'#3F8A24',fontSize:'.82rem',fontWeight:700,textDecoration:'none'}}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{fontSize:'1rem',padding:'.85rem'}}>
              {loading ? (
                <span style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'white',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* TNSDC + MSME badge */}
        <div style={{textAlign:'center',marginTop:'1.5rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px'}}>
          <div style={{height:'1px',flex:1,background:'#DDE8DF'}} />
          <p style={{color:'var(--gray-400)',fontSize:'.72rem',whiteSpace:'nowrap',fontWeight:600}}>TNSDC + MSME Recognised</p>
          <div style={{height:'1px',flex:1,background:'#DDE8DF'}} />
        </div>
        <p style={{textAlign:'center',color:'#A9BCAF',fontSize:'.7rem',marginTop:'.75rem'}}>© IGo Academy 2026 · Chennai, Tamil Nadu</p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

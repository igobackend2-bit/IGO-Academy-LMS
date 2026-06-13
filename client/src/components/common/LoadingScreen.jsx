export default function LoadingScreen() {
  return (
    <div style={{minHeight:'100vh',background:'#F5F9F6',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1.5rem'}}>
      <img src="/igo-logo.png" alt="IGo Academy" style={{height:'100px'}} />
      <div style={{display:'flex',gap:'6px'}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4FA02E',animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}} />
        ))}
      </div>
      <p style={{color:'#8A9A8E',fontSize:'.8rem',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700}}>IGo Academy</p>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

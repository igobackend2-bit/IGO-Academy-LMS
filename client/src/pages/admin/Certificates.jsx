import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

/* ─── Certificate Preview Modal ───────────────────────────────────────────── */
function CertificateModal({ cert, onClose }) {
  if (!cert) return null;

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=900,height=650');
    printWin.document.write(`
      <!DOCTYPE html><html><head>
      <title>Certificate – ${cert.certificate_id}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; }
        .cert { width:860px; min-height:580px; padding:48px 60px; border:3px solid #16402B; position:relative; font-family:'Manrope',sans-serif; }
        .cert::before { content:''; position:absolute; inset:8px; border:1px solid rgba(22,64,43,0.25); pointer-events:none; }
        .corner { position:absolute; width:48px; height:48px; border-color:#8DC63F; border-style:solid; }
        .corner.tl { top:6px; left:6px; border-width:3px 0 0 3px; }
        .corner.tr { top:6px; right:6px; border-width:3px 3px 0 0; }
        .corner.bl { bottom:6px; left:6px; border-width:0 0 3px 3px; }
        .corner.br { bottom:6px; right:6px; border-width:0 3px 3px 0; }
        .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
        .logo-text { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; color:#16402B; letter-spacing:2px; }
        .logo-sub { font-size:10px; color:#4FA02E; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin-top:2px; }
        .seal { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#16402B,#4FA02E); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:700; text-align:center; line-height:1.3; letter-spacing:0.5px; padding:8px; }
        .divider { height:2px; background:linear-gradient(90deg,transparent,#16402B,#8DC63F,#16402B,transparent); margin:0 0 28px; }
        .subtitle { font-size:11px; color:#4FA02E; font-weight:700; letter-spacing:5px; text-transform:uppercase; text-align:center; margin-bottom:12px; }
        .title { font-family:'Playfair Display',serif; font-size:38px; font-weight:900; color:#0C2014; text-align:center; margin-bottom:24px; }
        .body-text { font-size:14px; color:#4a5568; text-align:center; margin-bottom:8px; }
        .student-name { font-family:'Playfair Display',serif; font-size:30px; font-weight:700; color:#16402B; text-align:center; margin:12px 0; border-bottom:2px solid #8DC63F; padding-bottom:8px; display:inline-block; min-width:360px; }
        .course-name { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#235C39; text-align:center; margin:8px 0 28px; }
        .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:32px; }
        .sig-block { text-align:center; }
        .sig-line { width:160px; height:2px; background:linear-gradient(90deg,#16402B,#4FA02E); margin:0 auto 6px; border-radius:1px; }
        .sig-label { font-size:11px; color:#16402B; font-weight:800; text-transform:uppercase; letter-spacing:2px; }
        .sig-sub { font-size:10px; color:#718096; margin-top:3px; font-style:italic; }
        .sig-svg { display:block; margin:0 auto 4px; }
        .cert-id { text-align:center; }
        .cert-id-label { font-size:9px; color:#718096; text-transform:uppercase; letter-spacing:2px; margin-bottom:3px; }
        .cert-id-val { font-size:12px; color:#16402B; font-weight:700; font-family:monospace; }
        .cert-id-date { font-size:10px; color:#718096; margin-top:2px; }
        .recognition { font-size:9px; color:#718096; text-align:center; margin-top:20px; letter-spacing:1px; }
        @media print { body { margin:0; } }
      </style></head><body>
      <div class="cert">
        <div class="corner tl"></div><div class="corner tr"></div>
        <div class="corner bl"></div><div class="corner br"></div>
        <div style="text-align:center;margin-bottom:24px;position:relative;">
          <img src="http://localhost:3000/igo-logo.png" alt="IGo Academy" style="height:110px;object-fit:contain;background:transparent;" />
          <div class="seal" style="position:absolute;top:0;right:0;">VERIFIED<br>DIGITAL<br>CERT</div>
        </div>
        <div class="divider"></div>
        <p class="subtitle">Certificate of Completion</p>
        <h1 class="title">This is to Certify That</h1>
        <div style="text-align:center">
          <div class="student-name">${cert.full_name}</div>
        </div>
        <p class="body-text" style="margin-top:16px">has successfully completed the programme</p>
        <div class="course-name">${cert.course_title}</div>
        <p class="body-text">offered by IGO Academy, Chennai, Tamil Nadu</p>
        <p class="body-text" style="margin-top:6px; font-size:12px; color:#718096">
          TNSDC &amp; MSME Recognised · Agri-Entrepreneurship Programme
        </p>
        <div class="footer">
          <div class="sig-block">
            <svg class="sig-svg" width="150" height="44" viewBox="0 0 150 44">
              <path d="M 8,36 C 14,18 26,8 40,16 C 50,22 46,38 58,26 C 64,20 66,10 77,16 L 85,26 C 90,32 93,20 102,14 C 110,8 118,18 124,28 L 128,22 C 132,16 138,26 144,20" stroke="#16402B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 44,40 C 54,43 66,41 77,38" stroke="#16402B" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            </svg>
            <div class="sig-line"></div>
            <div class="sig-label">CEO</div>
            <div class="sig-sub">IGO Group</div>
          </div>
          <div class="cert-id">
            <div class="cert-id-label">Certificate ID</div>
            <div class="cert-id-val">${cert.certificate_id}</div>
            <div class="cert-id-date">Issued: ${dayjs(cert.issued_at).format('DD MMMM YYYY')}</div>
          </div>
          <div class="sig-block">
            <svg class="sig-svg" width="150" height="44" viewBox="0 0 150 44">
              <path d="M 6,30 Q 18,6 34,20 Q 48,34 54,16 L 62,8 C 67,2 75,12 78,22 C 81,30 76,38 84,26 C 91,16 99,10 110,18 Q 118,24 122,14 L 130,22 C 134,28 140,18 146,24" stroke="#16402B" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 30,36 C 42,40 54,38 66,34" stroke="#16402B" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            </svg>
            <div class="sig-line"></div>
            <div class="sig-label">Head</div>
            <div class="sig-sub">IGO Academy</div>
          </div>
        </div>
        <div class="recognition">
          Verify this certificate at igoacademy.in/verify/${cert.certificate_id}
        </div>
      </div>
      </body></html>
    `);
    printWin.document.close();
    setTimeout(() => printWin.print(), 600);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>

      <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'820px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>

        {/* Modal toolbar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <span style={{ fontSize:'1.1rem' }}>🏆</span>
            <span style={{ fontWeight:700, color:'#16402B', fontSize:'.95rem' }}>{cert.certificate_id}</span>
            <span style={{ background: cert.is_valid ? 'rgba(79,160,46,0.12)' : 'rgba(220,38,38,0.1)', color: cert.is_valid ? '#2d6a14' : '#991b1b', fontSize:'.7rem', fontWeight:700, padding:'2px 8px', borderRadius:'12px' }}>
              {cert.is_valid ? 'Valid' : 'Revoked'}
            </span>
          </div>
          <div style={{ display:'flex', gap:'.6rem' }}>
            <button onClick={handlePrint}
              style={{ background:'#16402B', color:'white', border:'none', borderRadius:'8px', padding:'.45rem 1rem', fontSize:'.8rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'.4rem' }}>
              🖨 Print / Save PDF
            </button>
            <button onClick={onClose}
              style={{ background:'#f3f4f6', border:'none', borderRadius:'8px', padding:'.45rem .75rem', fontSize:'.9rem', cursor:'pointer', color:'#6b7280' }}>✕</button>
          </div>
        </div>

        {/* Certificate preview */}
        <div style={{ padding:'2rem', background:'#f9fafb' }}>
          <div style={{
            background:'white', border:'3px solid #16402B', borderRadius:'4px',
            padding:'40px 52px', position:'relative', fontFamily:'Georgia, serif',
            boxShadow:'0 4px 24px rgba(22,64,43,0.08)',
          }}>
            {/* Corner decorations */}
            <div style={{ position:'absolute', width:40, height:40, top:10, left:10, borderColor:'#8DC63F', borderStyle:'solid', borderWidth:'3px 0 0 3px' }} />
            <div style={{ position:'absolute', width:40, height:40, top:10, right:10, borderColor:'#8DC63F', borderStyle:'solid', borderWidth:'3px 3px 0 0' }} />
            <div style={{ position:'absolute', width:40, height:40, bottom:10, left:10, borderColor:'#8DC63F', borderStyle:'solid', borderWidth:'0 0 3px 3px' }} />
            <div style={{ position:'absolute', width:40, height:40, bottom:10, right:10, borderColor:'#8DC63F', borderStyle:'solid', borderWidth:'0 3px 3px 0' }} />

            {/* Header — logo centered, seal absolutely pinned top-right */}
            <div style={{ position:'absolute', top:18, right:18, width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#16402B,#4FA02E)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white', fontSize:8, fontWeight:700, textAlign:'center', lineHeight:1.4, letterSpacing:.5, zIndex:2 }}>
              <div>VERIFIED</div><div>DIGITAL</div><div>CERT</div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%', marginBottom:28 }}>
              <img src="/igo-logo.png" alt="IGo Academy" style={{ height:110, objectFit:'contain', display:'block' }} />
            </div>

            {/* Divider */}
            <div style={{ height:2, background:'linear-gradient(90deg,transparent,#16402B,#8DC63F,#16402B,transparent)', marginBottom:24 }} />

            {/* Body */}
            <p style={{ fontSize:10, color:'#4FA02E', fontWeight:700, letterSpacing:5, textTransform:'uppercase', textAlign:'center', marginBottom:10 }}>Certificate of Completion</p>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:32, fontWeight:900, color:'#0C2014', textAlign:'center', marginBottom:20 }}>This is to Certify That</h1>

            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ display:'inline-block', fontFamily:'Georgia,serif', fontSize:26, fontWeight:700, color:'#16402B', borderBottom:'2px solid #8DC63F', paddingBottom:8, minWidth:320 }}>
                {cert.full_name}
              </div>
            </div>

            <p style={{ fontSize:13, color:'#4a5568', textAlign:'center', marginBottom:6 }}>has successfully completed the programme</p>
            <div style={{ fontFamily:'Georgia,serif', fontSize:17, fontWeight:700, color:'#235C39', textAlign:'center', marginBottom:20 }}>{cert.course_title}</div>
            <p style={{ fontSize:12, color:'#718096', textAlign:'center', marginBottom:4 }}>offered by IGo Academy, Chennai, Tamil Nadu</p>
            <p style={{ fontSize:10, color:'#a0aec0', textAlign:'center' }}>TNSDC &amp; MSME Recognised · Agri-Entrepreneurship Programme</p>

            {/* Footer — CEO left · cert ID center · Head right */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:32, paddingTop:12, borderTop:'1px solid rgba(22,64,43,0.10)' }}>

              {/* Left: CEO digital signature */}
              <div style={{ textAlign:'center', minWidth:150 }}>
                {/* Handwritten SVG signature */}
                <svg width="150" height="44" viewBox="0 0 150 44" style={{ display:'block', margin:'0 auto 2px' }}>
                  <path d="M 8,36 C 14,18 26,8 40,16 C 50,22 46,38 58,26 C 64,20 66,10 77,16 L 85,26 C 90,32 93,20 102,14 C 110,8 118,18 124,28 L 128,22 C 132,16 138,26 144,20" stroke="#16402B" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 44,40 C 54,43 66,41 77,38" stroke="#16402B" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                </svg>
                <div style={{ width:150, height:2, background:'linear-gradient(90deg,#16402B,#4FA02E)', margin:'0 auto 6px', borderRadius:1 }} />
                <div style={{ fontSize:10, color:'#16402B', fontWeight:800, textTransform:'uppercase', letterSpacing:2 }}>CEO</div>
                <div style={{ fontSize:9, color:'#718096', marginTop:2, fontStyle:'italic' }}>IGO Group</div>
              </div>

              {/* Center: Cert ID + date */}
              <div style={{ textAlign:'center', flex:1, padding:'0 1rem' }}>
                <div style={{ fontSize:8, color:'#a0aec0', textTransform:'uppercase', letterSpacing:2.5, marginBottom:5 }}>Certificate ID</div>
                <div style={{ fontSize:12, color:'#16402B', fontWeight:800, fontFamily:'monospace', letterSpacing:1 }}>{cert.certificate_id}</div>
                <div style={{ fontSize:9, color:'#718096', marginTop:4 }}>Issued: {dayjs(cert.issued_at).format('DD MMMM YYYY')}</div>
              </div>

              {/* Right: Head digital signature */}
              <div style={{ textAlign:'center', minWidth:150 }}>
                {/* Handwritten SVG signature */}
                <svg width="150" height="44" viewBox="0 0 150 44" style={{ display:'block', margin:'0 auto 2px' }}>
                  <path d="M 6,30 Q 18,6 34,20 Q 48,34 54,16 L 62,8 C 67,2 75,12 78,22 C 81,30 76,38 84,26 C 91,16 99,10 110,18 Q 118,24 122,14 L 130,22 C 134,28 140,18 146,24" stroke="#16402B" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 30,36 C 42,40 54,38 66,34" stroke="#16402B" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                </svg>
                <div style={{ width:150, height:2, background:'linear-gradient(90deg,#4FA02E,#16402B)', margin:'0 auto 6px', borderRadius:1 }} />
                <div style={{ fontSize:10, color:'#16402B', fontWeight:800, textTransform:'uppercase', letterSpacing:2 }}>Head</div>
                <div style={{ fontSize:9, color:'#718096', marginTop:2, fontStyle:'italic' }}>IGO Academy</div>
              </div>
            </div>

            {/* Verify URL */}
            <p style={{ fontSize:8, color:'#a0aec0', textAlign:'center', marginTop:16, letterSpacing:1 }}>
              Verify at igoacademy.in/verify/{cert.certificate_id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function AdminCertificates() {
  const qc = useQueryClient();
  const [preview, setPreview] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['certs'],
    queryFn: () => api.get('/certificates').then(r => r.data.data),
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }) => api.put(`/certificates/${id}/revoke`, { reason }),
    onSuccess: () => { toast.success('Certificate revoked'); qc.invalidateQueries(['certs']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Revoke failed'),
  });

  return (
    <div className="p-8 page-enter">
      <h1 className="text-2xl font-black text-igo-navy mb-2">Certificates</h1>
      <p className="text-gray-400 text-sm mb-6">Click any Certificate ID to preview and print.</p>

      <div className="bg-white rounded-xl shadow-igo-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-igo-navy-light">
            <tr>
              {['Certificate ID', 'Student', 'Course', 'Issued', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-igo-navy uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading…</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No certificates issued yet.</td></tr>
            ) : data?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                {/* Clickable certificate ID */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => setPreview(c)}
                    style={{ fontFamily:'monospace', color:'#16402B', fontWeight:700, textDecoration:'underline', textDecorationStyle:'dotted', textUnderlineOffset:'3px', background:'none', border:'none', cursor:'pointer', fontSize:'.85rem', padding:0 }}
                    title="Click to preview certificate">
                    {c.certificate_id}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{c.course_title}</td>
                <td className="px-4 py-3 text-gray-500">{dayjs(c.issued_at).format('DD MMM YYYY')}</td>
                <td className="px-4 py-3">
                  <span style={{ background: c.is_valid ? 'rgba(79,160,46,0.12)' : 'rgba(220,38,38,0.1)', color: c.is_valid ? '#2d6a14' : '#991b1b', fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'12px' }}>
                    {c.is_valid ? 'Valid' : 'Revoked'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <button onClick={() => setPreview(c)}
                    style={{ fontSize:'.75rem', color:'#16402B', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}
                    title="Preview certificate">
                    👁 Preview
                  </button>
                  {c.is_valid && (
                    <button
                      onClick={() => { if (window.confirm(`Revoke ${c.certificate_id}?`)) revokeMutation.mutate({ id: c.id, reason: 'Admin revoked' }); }}
                      style={{ fontSize:'.75rem', color:'#dc2626', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CertificateModal cert={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

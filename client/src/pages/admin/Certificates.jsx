import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

/* ─── Certificate Preview Modal ───────────────────────────────────────────── */
function CertificateModal({ cert, onClose }) {
  if (!cert) return null;
  return createPortal(<CertificateModalInner cert={cert} onClose={onClose} />, document.body);
}

function CertificateModalInner({ cert, onClose }) {

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
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{
        background: 'white', borderRadius: '16px', width: '100%',
        maxWidth: '860px', maxHeight: '94vh', overflowY: 'auto',
        boxShadow: '0 32px 100px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Toolbar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🏆</span>
            <span style={{ fontWeight: 700, color: '#16402B', fontSize: '.95rem', fontFamily: 'monospace' }}>
              {cert.certificate_id}
            </span>
            <span style={{
              background: cert.is_valid ? 'rgba(79,160,46,0.12)' : 'rgba(220,38,38,0.1)',
              color: cert.is_valid ? '#2d6a14' : '#991b1b',
              fontSize: '.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px',
            }}>
              {cert.is_valid ? 'Valid' : 'Revoked'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <button onClick={handlePrint} style={{
              background: '#16402B', color: 'white', border: 'none', borderRadius: '8px',
              padding: '.45rem 1rem', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
            }}>
              🖨 Print / Save PDF
            </button>
            <button onClick={onClose} style={{
              background: '#f3f4f6', border: 'none', borderRadius: '8px',
              padding: '.45rem .85rem', fontSize: '1rem', cursor: 'pointer', color: '#374151',
              fontWeight: 700, lineHeight: 1,
            }}>✕</button>
          </div>
        </div>

        {/* ── Certificate Canvas ── */}
        <div style={{ padding: '2rem 2.5rem', background: '#f4f6f0', overflowY: 'auto' }}>
          <div style={{
            background: 'white', border: '3px solid #16402B', position: 'relative',
            padding: '44px 56px 36px', fontFamily: "'Georgia', 'Times New Roman', serif",
            boxShadow: '0 8px 32px rgba(22,64,43,0.10)',
          }}>
            {/* Inner border */}
            <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(22,64,43,0.18)', pointerEvents: 'none' }} />

            {/* Corner accents */}
            {[
              { top: 6, left: 6, borderWidth: '3px 0 0 3px' },
              { top: 6, right: 6, borderWidth: '3px 3px 0 0' },
              { bottom: 6, left: 6, borderWidth: '0 0 3px 3px' },
              { bottom: 6, right: 6, borderWidth: '0 3px 3px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 44, height: 44, borderColor: '#8DC63F', borderStyle: 'solid', ...s }} />
            ))}

            {/* Verified seal */}
            <div style={{
              position: 'absolute', top: 20, right: 20, width: 62, height: 62,
              borderRadius: '50%', background: 'linear-gradient(135deg,#16402B,#4FA02E)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontSize: 7.5, fontWeight: 700,
              textAlign: 'center', lineHeight: 1.5, letterSpacing: 0.5, zIndex: 2,
              fontFamily: 'sans-serif',
            }}>
              <div>VERIFIED</div><div>DIGITAL</div><div>CERT</div>
            </div>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src="/igo-logo.png" alt="IGo Academy" style={{ height: 90, objectFit: 'contain' }} />
            </div>

            {/* Divider */}
            <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#16402B 30%,#8DC63F 50%,#16402B 70%,transparent)', marginBottom: 22 }} />

            {/* Subtitle */}
            <p style={{ fontSize: 10, color: '#4FA02E', fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10, fontFamily: 'sans-serif' }}>
              Certificate of Completion
            </p>

            {/* Title */}
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0C2014', textAlign: 'center', marginBottom: 18, letterSpacing: '-0.5px' }}>
              This is to Certify That
            </h2>

            {/* Student name */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{
                display: 'inline-block', fontSize: 26, fontWeight: 700, color: '#16402B',
                borderBottom: '2px solid #8DC63F', paddingBottom: 7, minWidth: 300,
              }}>
                {cert.full_name}
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 8 }}>
              has successfully completed the programme
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#235C39', textAlign: 'center', marginBottom: 18 }}>
              {cert.course_title}
            </p>
            <p style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 3, fontFamily: 'sans-serif' }}>
              offered by IGo Academy, Chennai, Tamil Nadu
            </p>
            <p style={{ fontSize: 10, color: '#a0aec0', textAlign: 'center', fontFamily: 'sans-serif' }}>
              TNSDC &amp; MSME Recognised · Agri-Entrepreneurship Programme
            </p>

            {/* Footer */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'flex-end', marginTop: 32, paddingTop: 16,
              borderTop: '1px solid rgba(22,64,43,0.12)', gap: '1rem',
            }}>
              {/* CEO Seal */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%', margin: '0 auto 10px',
                  border: '3px solid #16402B', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'radial-gradient(circle, #f0f7f0 60%, #d4eadb)',
                  boxShadow: '0 0 0 1px #8DC63F, inset 0 0 0 3px rgba(22,64,43,0.08)',
                  position: 'relative',
                }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute' }}>
                    <path id="ceo-arc" d="M 12,40 a 28,28 0 0,1 56,0" fill="none"/>
                    <text fontSize="7.5" fontWeight="700" fill="#16402B" fontFamily="sans-serif" letterSpacing="3">
                      <textPath href="#ceo-arc" startOffset="12%">· IGO GROUP · AUTHORISED ·</textPath>
                    </text>
                  </svg>
                  <div style={{ fontSize: 9, color: '#16402B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'sans-serif', lineHeight: 1.4, zIndex: 1 }}>
                    <div style={{ fontSize: 18, marginBottom: 1 }}>🏛</div>
                    <div>CEO</div>
                    <div style={{ fontSize: 7.5, opacity: 0.7, marginTop: 1 }}>SEAL</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#16402B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'sans-serif' }}>CEO</div>
                <div style={{ fontSize: 10, color: '#718096', marginTop: 2, fontStyle: 'italic', fontFamily: 'sans-serif' }}>IGO Group</div>
              </div>

              {/* Cert ID block */}
              <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f9faf7', border: '1px solid rgba(22,64,43,0.1)', borderRadius: 6 }}>
                <div style={{ fontSize: 8, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 5, fontFamily: 'sans-serif' }}>
                  Certificate ID
                </div>
                <div style={{ fontSize: 13, color: '#16402B', fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
                  {cert.certificate_id}
                </div>
                <div style={{ fontSize: 10, color: '#718096', marginTop: 5, fontFamily: 'sans-serif' }}>
                  Issued: {dayjs(cert.issued_at).format('DD MMMM YYYY')}
                </div>
                <div style={{ fontSize: 8, color: '#a0aec0', marginTop: 4, fontFamily: 'sans-serif' }}>
                  Verify at igoacademy.in/verify/{cert.certificate_id}
                </div>
              </div>

              {/* HEAD Seal */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%', margin: '0 auto 10px',
                  border: '3px solid #16402B', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'radial-gradient(circle, #f0f7f0 60%, #d4eadb)',
                  boxShadow: '0 0 0 1px #8DC63F, inset 0 0 0 3px rgba(22,64,43,0.08)',
                  position: 'relative',
                }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute' }}>
                    <path id="head-arc" d="M 12,40 a 28,28 0 0,1 56,0" fill="none"/>
                    <text fontSize="7.5" fontWeight="700" fill="#16402B" fontFamily="sans-serif" letterSpacing="3">
                      <textPath href="#head-arc" startOffset="8%">· IGO ACADEMY · CERTIFIED ·</textPath>
                    </text>
                  </svg>
                  <div style={{ fontSize: 9, color: '#16402B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'sans-serif', lineHeight: 1.4, zIndex: 1 }}>
                    <div style={{ fontSize: 18, marginBottom: 1 }}>🎓</div>
                    <div>HEAD</div>
                    <div style={{ fontSize: 7.5, opacity: 0.7, marginTop: 1 }}>SEAL</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#16402B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'sans-serif' }}>HEAD</div>
                <div style={{ fontSize: 10, color: '#718096', marginTop: 2, fontStyle: 'italic', fontFamily: 'sans-serif' }}>IGO Academy</div>
              </div>
            </div>
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

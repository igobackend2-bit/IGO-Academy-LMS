import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const COLOR = {
  navy:    '#0C2014',
  green:   '#16402B',
  mid:     '#235C39',
  gray50:  '#f6f8f5',
  gray200: '#dde5dd',
  gray400: '#9ca3af',
  gold:    '#b45309',
  goldBg:  '#fef3c7',
};

/* ─── SVG: download icon ─────────────────────────────────────── */
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 4 }}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 4 }}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

export default function StudentCertificates() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['my-certs'],
    queryFn: () => api.get('/certificates/my').then(r => r.data.data || []),
  });

  const download = async (certId) => {
    try {
      const res = await api.get(`/certificates/${certId}/download`);
      window.open(res.data.data.url, '_blank');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: COLOR.gray50, fontFamily: 'Sora, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg,${COLOR.navy} 0%,${COLOR.green} 70%,${COLOR.mid} 100%)`, padding: '1.5rem 2rem 3rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(141,198,63,.07)', pointerEvents: 'none' }} />
        {/* Gold ribbon accent */}
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(180,83,9,.08)', pointerEvents: 'none' }} />
        <p style={{ color: 'rgba(141,198,63,.85)', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Student Portal</p>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '.2rem' }}>My Certificates</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem' }}>Proof of your learning achievements</p>
      </div>

      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.6rem' }}>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
          </div>

        ) : data.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────── */
          <div style={{ background: 'white', borderRadius: 18, padding: '4rem 2rem', textAlign: 'center', border: `1px solid ${COLOR.gray200}`, boxShadow: '0 2px 12px rgba(13,38,25,.05)' }}>
            {/* Decorative ring */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: COLOR.goldBg, border: `3px solid #fde68a`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
              🎓
            </div>
            <p style={{ color: COLOR.navy, fontWeight: 800, fontSize: '1.05rem', marginBottom: '.4rem' }}>No certificates yet</p>
            <p style={{ color: COLOR.gray400, fontSize: '.83rem', maxWidth: 300, margin: '0 auto .1rem', lineHeight: 1.6 }}>
              Complete your enrolled courses to earn IGo Academy certificates.
            </p>
            {/* Milestone hint */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', marginTop: '1.5rem', background: '#f0fdf4', borderRadius: 10, padding: '.55rem 1rem', border: `1px solid #bbf7d0` }}>
              <span style={{ fontSize: '.75rem' }}>💡</span>
              <p style={{ color: COLOR.green, fontSize: '.75rem', fontWeight: 600, margin: 0 }}>Finish all modules in a course to unlock your certificate</p>
            </div>
          </div>

        ) : (
          /* ── Certificate cards ────────────────────────────────── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.1rem' }}>
            {data.map(c => (
              <div key={c.id}
                style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${c.is_valid ? '#fde68a' : COLOR.gray200}`, boxShadow: '0 4px 18px rgba(13,38,25,.07)', overflow: 'hidden', position: 'relative' }}>

                {/* Gold top accent */}
                <div style={{ height: 4, background: c.is_valid ? 'linear-gradient(90deg,#f59e0b,#d97706)' : '#e5e7eb' }} />

                <div style={{ padding: '1.25rem' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: c.is_valid ? COLOR.goldBg : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      🎓
                    </div>
                    <span style={{
                      background: c.is_valid ? '#dcfce7' : '#fee2e2',
                      color: c.is_valid ? '#15803d' : '#dc2626',
                      fontSize: '.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: '.04em',
                    }}>
                      {c.is_valid ? '✓ Valid' : '✗ Revoked'}
                    </span>
                  </div>

                  {/* Course title */}
                  <h3 style={{ color: COLOR.navy, fontWeight: 800, fontSize: '.95rem', marginBottom: '.4rem', lineHeight: 1.35 }}>{c.course_title}</h3>

                  {/* Certificate ID */}
                  <div style={{ background: COLOR.gray50, borderRadius: 8, padding: '.4rem .65rem', marginBottom: '.5rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                    <span style={{ color: COLOR.gray400, fontSize: '.65rem', fontWeight: 600 }}>ID</span>
                    <span style={{ fontFamily: 'monospace', color: COLOR.green, fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em' }}>{c.certificate_id}</span>
                  </div>

                  {/* Issue date */}
                  <p style={{ color: COLOR.gray400, fontSize: '.72rem', marginBottom: '1.1rem' }}>
                    Issued on <strong style={{ color: COLOR.gray400 }}>{dayjs(c.issued_at).format('DD MMMM YYYY')}</strong>
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '.6rem' }}>
                    {c.is_valid && (
                      <button onClick={() => download(c.id)}
                        style={{ flex: 1, background: `linear-gradient(135deg,${COLOR.green},${COLOR.mid})`, color: 'white', border: 'none', borderRadius: 9, padding: '.55rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DownloadIcon /> Download PDF
                      </button>
                    )}
                    <a href={`/verify/${c.certificate_id}`} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, background: COLOR.goldBg, color: COLOR.gold, border: `1.5px solid #fde68a`, borderRadius: 9, padding: '.55rem', fontSize: '.78rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LinkIcon /> Verify
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

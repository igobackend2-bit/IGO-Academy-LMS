import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export default function StudentNotes() {
  const [expanded, setExpanded] = useState({});

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['student-resources', 'note'],
    queryFn: () => api.get('/resources/student?type=note').then(r => r.data.data || []),
  });

  const toggle = (id) => setExpanded(s => ({ ...s, [id]: !s[id] }));

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8f5' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0C2014 0%,#16402B 70%,#235C39 100%)', padding: '1.5rem 2rem 2.8rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(141,198,63,0.07)', pointerEvents: 'none' }} />
        <div>
          <p style={{ color: 'rgba(141,198,63,0.85)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Resources</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.01em', marginBottom: '.2rem' }}>📝 Notes</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.8rem' }}>Study notes and summaries shared by IGO Academy</p>
        </div>
      </div>

      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.5rem', position: 'relative', zIndex: 1 }}>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ background: 'white', borderRadius: 16, height: 100, opacity: 0.7, boxShadow: '0 2px 10px rgba(13,38,25,.05)' }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '3.5rem', textAlign: 'center', border: '1px solid #dde5dd', marginTop: '.5rem' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📝</p>
            <p style={{ color: '#0C2014', fontWeight: 700, fontSize: '1rem', marginBottom: '.35rem' }}>No notes posted yet</p>
            <p style={{ color: '#9ca3af', fontSize: '.82rem' }}>Check back soon — your admin will share study notes here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '.5rem' }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e8f0e8', boxShadow: '0 2px 10px rgba(13,38,25,.05)', overflow: 'hidden' }}>

                {/* Card header — click to expand/collapse */}
                <button onClick={() => toggle(item.id)} style={{ width: '100%', background: 'linear-gradient(135deg,#1a2f1e,#2d5a3d)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '.75rem', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(141,198,63,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📝</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'rgba(141,198,63,0.7)', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Note #{idx + 1}</p>
                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: '.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h2>
                    {(item.course_title || item.batch_name) && (
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '.62rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.batch_name ? `📦 ${item.course_title} · ${item.batch_name}` : `📚 ${item.course_title}`}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    {item.pdf_path && <span style={{ background: 'rgba(141,198,63,0.2)', color: '#8DC63F', fontSize: '.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>📄 PDF</span>}
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.9rem', transition: 'transform .2s', transform: expanded[item.id] ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▾</span>
                  </div>
                </button>

                {/* Collapsible body */}
                {expanded[item.id] && (
                  <div>
                    {/* Text content */}
                    {item.content && (
                      <div onContextMenu={e => e.preventDefault()}
                        style={{ padding: '1.25rem 1.5rem', userSelect: 'none', WebkitUserSelect: 'none', background: '#fafff8', borderBottom: item.pdf_path ? '1px solid #e8f0e8' : 'none' }}>
                        <p style={{ color: '#1e3a2a', lineHeight: 1.85, fontSize: '.88rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content}</p>
                      </div>
                    )}

                    {/* PDF viewer — inline, no download */}
                    {item.pdf_path && (
                      <div style={{ position: 'relative' }}>
                        <div style={{ background: '#1a2f1e', padding: '.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <span style={{ color: '#8DC63F', fontSize: '.75rem', fontWeight: 700 }}>📄 PDF Document</span>
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '.65rem' }}>View only • not available for download</span>
                        </div>
                        <div style={{ position: 'relative' }} onContextMenu={e => e.preventDefault()}>
                          <iframe
                            src={`/api/resources/${item.id}/pdf#toolbar=0&navpanes=0&scrollbar=1`}
                            style={{ display: 'block', width: '100%', height: 600, border: 'none' }}
                            title={item.title}
                          />
                          {/* Bottom shield — blocks right-click on toolbar area */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, zIndex: 2, pointerEvents: 'auto', cursor: 'default' }}
                            onContextMenu={e => e.preventDefault()} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

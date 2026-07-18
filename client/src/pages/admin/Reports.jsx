/**
 * AdminReports — full-featured reports page for IGO Academy admin
 * Sections: Progress Report, Attendance Report
 */
import { useState, useEffect } from 'react';
import api from '@/services/api';

/* ── Skeleton loader ─────────────────────────────────────────────── */
function Skeleton({ width = '100%', height = 18, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg,#e8eaed 25%,#f4f5f7 50%,#e8eaed 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s infinite linear',
      ...style,
    }} />
  );
}

/* ── Summary stat card ───────────────────────────────────────────── */
function SumStat({ label, value, color, icon }) {
  return (
    <div style={{
      background: 'white', border: `1.5px solid ${color}22`,
      borderRadius: 16, padding: '1.1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 2px 8px rgba(12,32,20,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}15`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.25rem',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--navy-dark)', lineHeight: 1, letterSpacing: '-.03em' }}>
          {value == null ? <Skeleton width={40} height={22} /> : value}
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', fontWeight: 500, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────── */
function Badge({ text, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color, fontSize: '.68rem', fontWeight: 700,
      padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
    }}>{text}</span>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--gray-400)' }}>
      <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>📊</div>
      <p style={{ fontWeight: 600, fontSize: '.92rem' }}>{message}</p>
    </div>
  );
}

/* ── Wheat SVG divider (matches AdminDashboard) ──────────────────── */
function WheatDivider() {
  return (
    <svg viewBox="0 0 1200 40" style={{ width: '100%', display: 'block', marginTop: -1 }} preserveAspectRatio="none">
      <path d="M0 20 Q300 0 600 20 Q900 40 1200 20 L1200 40 L0 40 Z" fill="var(--gray-50)" />
      {[60,160,260,360,460,560,660,760,860,960,1060,1140].map((sx, i) => (
        <g key={i}>
          <line x1={sx} y1="22" x2={sx} y2="8" stroke="#8DC63F" strokeWidth="1.2" opacity="0.5" />
          <ellipse cx={sx} cy="5" rx="2.5" ry="5" fill="#C8A038" opacity="0.45" />
        </g>
      ))}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
export default function AdminReports() {
  const [tab, setTab]               = useState('progress');
  const [courses, setCourses]       = useState([]);
  const [courseId, setCourseId]     = useState('');
  const [progress, setProgress]     = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingData,    setLoadingData]    = useState(false);

  /* load courses once */
  useEffect(() => {
    api.get('/courses')
      .then(r => setCourses(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  /* load report when course or tab changes */
  useEffect(() => {
    if (!courseId) { setProgress(null); setAttendance(null); return; }
    setLoadingData(true);
    if (tab === 'progress') {
      api.get('/admin/reports/progress', { params: { course_id: courseId } })
        .then(r => setProgress(r.data.data ?? []))
        .catch(() => setProgress([]))
        .finally(() => setLoadingData(false));
    } else {
      api.get('/admin/reports/attendance', { params: { course_id: courseId } })
        .then(r => setAttendance(r.data.data ?? []))
        .catch(() => setAttendance([]))
        .finally(() => setLoadingData(false));
    }
  }, [courseId, tab]);

  /* derived stats */
  const totalEnrolled = progress?.length ?? 0;
  const activeCount   = progress?.filter(p => !p.is_expired).length ?? 0;
  const expiredCount  = progress?.filter(p => p.is_expired).length  ?? 0;
  const avgModules    = progress?.length
    ? Math.round(progress.reduce((s, p) => s + (Number(p.completed_modules) || 0), 0) / progress.length)
    : 0;

  const selectedCourse = courses.find(c => String(c.id) === String(courseId));

  const TabBtn = ({ id, label, icon }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '.6rem 1.25rem', borderRadius: 10, border: 'none',
        cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', transition: 'all .18s',
        background: tab === id ? 'var(--navy-dark)' : 'transparent',
        color:      tab === id ? 'white' : 'var(--gray-500)',
        boxShadow:  tab === id ? '0 4px 12px rgba(12,32,20,0.22)' : 'none',
      }}
    >
      <span>{icon}</span>{label}
    </button>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .rpt-row:hover td { background:#f0f9f0 !important; }
        .rpt-row td { transition: background .12s; }
      `}</style>

      {/* ── Header banner ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0C2014 0%,#16402B 55%,#235C39 100%)',
        padding: '2rem 2.5rem 0', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:240, height:240, borderRadius:'50%', background:'rgba(141,198,63,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:20,  right:160, width:120, height:120, borderRadius:'50%', background:'rgba(141,198,63,0.04)', pointerEvents:'none' }} />
        <p style={{ color:'rgba(141,198,63,0.9)', fontSize:'.72rem', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:'.5rem' }}>
          IGo Academy · Admin
        </p>
        <h1 style={{ fontSize:'1.9rem', fontWeight:800, marginBottom:'.35rem', letterSpacing:'-.03em' }}>
          Reports
        </h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'.875rem', marginBottom:'2rem' }}>
          Student progress, attendance &amp; performance analytics
        </p>
        <WheatDivider />
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '1.5rem 2rem 3rem' }}>

        {/* Filter bar */}
        <div style={{
          background:'white', borderRadius:16, padding:'1.25rem 1.5rem',
          border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)',
          display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginBottom:'1.5rem',
        }}>
          <div style={{ flex:'1 1 260px' }}>
            <label style={{ display:'block', fontSize:'.7rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'.35rem' }}>
              Select Course
            </label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              style={{
                width:'100%', padding:'.55rem .9rem',
                border:'1.5px solid var(--gray-200)', borderRadius:10,
                fontSize:'.875rem', fontWeight:500, color:'var(--navy-dark)',
                background:'white', cursor:'pointer', outline:'none', transition:'border-color .15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--green)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--gray-200)'; }}
            >
              <option value="">— Choose a course —</option>
              {loadingCourses
                ? <option disabled>Loading…</option>
                : courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
              }
            </select>
          </div>

          <div style={{ display:'flex', gap:6, background:'var(--gray-50)', borderRadius:12, padding:4, border:'1px solid var(--gray-200)' }}>
            <TabBtn id="progress"   label="Progress"   icon="📈" />
            <TabBtn id="attendance" label="Attendance"  icon="📋" />
          </div>
        </div>

        {/* No course selected */}
        {!courseId && (
          <div style={{
            background:'white', borderRadius:20, padding:'4rem 2rem',
            border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)', textAlign:'center',
          }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📊</div>
            <h2 style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--navy-dark)', marginBottom:'.5rem' }}>
              Select a course to view reports
            </h2>
            <p style={{ color:'var(--gray-400)', fontSize:'.88rem' }}>
              Use the dropdown above to choose a course and switch between progress &amp; attendance views.
            </p>
          </div>
        )}

        {/* ── Progress Report ── */}
        {courseId && tab === 'progress' && (
          <div className="card-enter">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              <SumStat label="Total Enrolled"     value={loadingData ? null : totalEnrolled} icon="🎓" color="var(--navy)"     />
              <SumStat label="Active Enrollments" value={loadingData ? null : activeCount}   icon="✅" color="var(--green)"    />
              <SumStat label="Expired"            value={loadingData ? null : expiredCount}  icon="⚠️" color="#D97706"         />
              <SumStat label="Avg Modules Done"   value={loadingData ? null : avgModules}    icon="📚" color="var(--gold)"     />
            </div>

            <div style={{ background:'white', borderRadius:20, overflow:'hidden', border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.5rem' }}>
                <div>
                  <h2 style={{ fontSize:'1rem', fontWeight:800, color:'var(--navy-dark)', marginBottom:2 }}>Student Progress Report</h2>
                  {selectedCourse && <p style={{ fontSize:'.75rem', color:'var(--gray-400)', fontWeight:500 }}>{selectedCourse.title}</p>}
                </div>
                <Badge text={`${totalEnrolled} students`} color="var(--navy-dark)" bg="var(--gray-50)" />
              </div>

              {loadingData ? (
                <div style={{ padding:'1.5rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ display:'flex', gap:'1rem', marginBottom:'1rem', alignItems:'center' }}>
                      <Skeleton width={160} height={16} /><Skeleton width={200} height={16} />
                      <Skeleton width={80}  height={16} /><Skeleton width={80}  height={16} />
                      <Skeleton width={60}  height={16} /><Skeleton width={70}  height={20} radius={20} />
                    </div>
                  ))}
                </div>
              ) : !progress?.length ? (
                <EmptyState message="No enrollments found for this course." />
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                    <thead>
                      <tr style={{ background:'#F7FAF7' }}>
                        {['#','Student','Email','Start Date','End Date','Modules Done','Status'].map(h => (
                          <th key={h} style={{ padding:'.7rem 1rem', textAlign:'left', fontSize:'.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--gray-400)', borderBottom:'1px solid var(--gray-100)', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {progress.map((p, i) => (
                        <tr key={i} className="rpt-row" style={{ borderBottom:'1px solid var(--gray-100)' }}>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-300)', fontWeight:600 }}>{i + 1}</td>
                          <td style={{ padding:'.75rem 1rem', fontWeight:700, color:'var(--navy-dark)' }}>{p.full_name}</td>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-400)' }}>{p.email}</td>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-500)', whiteSpace:'nowrap' }}>
                            {p.start_date ? new Date(p.start_date).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-500)', whiteSpace:'nowrap' }}>
                            {p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding:'.75rem 1rem' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ height:6, width:60, borderRadius:3, background:'var(--gray-100)', overflow:'hidden' }}>
                                <div style={{ height:'100%', borderRadius:3, width:`${Math.min(100,(Number(p.completed_modules)/10)*100)}%`, background:'var(--green)', transition:'width .4s ease' }} />
                              </div>
                              <span style={{ fontWeight:700, color:'var(--navy-dark)' }}>{p.completed_modules}</span>
                            </div>
                          </td>
                          <td style={{ padding:'.75rem 1rem' }}>
                            {p.is_expired
                              ? <Badge text="Expired" color="#B45309" bg="#FEF3C7" />
                              : <Badge text="Active"  color="#166534" bg="#DCFCE7" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Attendance Report ── */}
        {courseId && tab === 'attendance' && (
          <div className="card-enter">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              <SumStat label="Total Records"   value={loadingData ? null : (attendance?.length ?? 0)}                                   icon="📋" color="var(--navy)"  />
              <SumStat label="Present"         value={loadingData ? null : attendance?.filter(a => a.status === 'present').length ?? 0} icon="✅" color="var(--green)" />
              <SumStat label="Absent"          value={loadingData ? null : attendance?.filter(a => a.status === 'absent').length  ?? 0} icon="❌" color="#EF4444"      />
              <SumStat label="Unique Students" value={loadingData ? null : new Set(attendance?.map(a => a.email)).size ?? 0}           icon="👥" color="var(--gold)"  />
            </div>

            <div style={{ background:'white', borderRadius:20, overflow:'hidden', border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.5rem' }}>
                <div>
                  <h2 style={{ fontSize:'1rem', fontWeight:800, color:'var(--navy-dark)', marginBottom:2 }}>Attendance Report</h2>
                  {selectedCourse && <p style={{ fontSize:'.75rem', color:'var(--gray-400)', fontWeight:500 }}>{selectedCourse.title}</p>}
                </div>
                <Badge text={`${attendance?.length ?? 0} records`} color="var(--navy-dark)" bg="var(--gray-50)" />
              </div>

              {loadingData ? (
                <div style={{ padding:'1.5rem' }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} style={{ display:'flex', gap:'1rem', marginBottom:'1rem', alignItems:'center' }}>
                      <Skeleton width={160} height={16} /><Skeleton width={200} height={16} />
                      <Skeleton width={100} height={16} /><Skeleton width={120} height={16} />
                      <Skeleton width={70}  height={20} radius={20} />
                    </div>
                  ))}
                </div>
              ) : !attendance?.length ? (
                <EmptyState message="No attendance records found for this course." />
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                    <thead>
                      <tr style={{ background:'#F7FAF7' }}>
                        {['#','Student','Email','Class Type','Marked At','Status'].map(h => (
                          <th key={h} style={{ padding:'.7rem 1rem', textAlign:'left', fontSize:'.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--gray-400)', borderBottom:'1px solid var(--gray-100)', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a, i) => (
                        <tr key={i} className="rpt-row" style={{ borderBottom:'1px solid var(--gray-100)' }}>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-300)', fontWeight:600 }}>{i + 1}</td>
                          <td style={{ padding:'.75rem 1rem', fontWeight:700, color:'var(--navy-dark)' }}>{a.full_name}</td>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-400)' }}>{a.email}</td>
                          <td style={{ padding:'.75rem 1rem' }}>
                            <Badge
                              text={a.class_type ?? 'N/A'}
                              color={a.class_type === 'live' ? '#0E7490' : 'var(--navy)'}
                              bg={a.class_type === 'live' ? '#E0F7FA' : 'var(--gray-50)'}
                            />
                          </td>
                          <td style={{ padding:'.75rem 1rem', color:'var(--gray-500)', whiteSpace:'nowrap' }}>
                            {a.marked_at ? new Date(a.marked_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '—'}
                          </td>
                          <td style={{ padding:'.75rem 1rem' }}>
                            {a.status === 'present'
                              ? <Badge text="Present" color="#166534" bg="#DCFCE7" />
                              : a.status === 'absent'
                              ? <Badge text="Absent"  color="#991B1B" bg="#FEE2E2" />
                              : <Badge text={a.status ?? 'N/A'} color="var(--gray-400)" bg="var(--gray-50)" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

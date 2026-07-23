/**
 * StudentCourseView — premium course detail page
 */
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

/* ── Skeleton bar ────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#e8eaed 25%,#f4f5f7 50%,#e8eaed 75%)',
      backgroundSize: '400% 100%', animation: 'sko 1.4s infinite linear',
    }} />
  );
}

/* ── Level badge colour map ──────────────────────────────────── */
const LEVEL = {
  beginner:     { bg: '#dcfce7', color: '#15803d' },
  intermediate: { bg: '#fef3c7', color: '#b45309' },
  advanced:     { bg: '#fee2e2', color: '#991b1b' },
};

export default function StudentCourseView() {
  const { courseId } = useParams();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data.data),
  });
  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance-my', courseId],
    queryFn: () => api.get(`/attendance/my/${courseId}`).then(r => r.data.data ?? []),
    staleTime: 0, // always refetch on mount so progress shows immediately after finishing a video
  });

  const getAtt = (moduleId) => attendance?.find(a => a.class_id === moduleId);

  const totalModules   = course?.modules?.length || 0;
  const doneModules    = attendance?.filter(a => a.completed).length || 0;
  const progressPct    = totalModules > 0 ? Math.round((doneModules / totalModules) * 100) : 0;
  const lvl            = LEVEL[course?.level] ?? { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8f5' }}>
      <style>{`@keyframes sko{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0C2014 0%,#16402B 65%,#235C39 100%)',
        padding: '1.75rem 2rem 3.5rem', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(141,198,63,0.07)', pointerEvents:'none' }} />

        {/* Back link */}
        <Link to="/student/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(141,198,63,0.9)', fontSize: '.78rem', fontWeight: 700,
          textDecoration: 'none', marginBottom: '1.25rem',
        }}>← My Courses</Link>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <Skel w={80} h={22} r={20} /><Skel w={320} h={28} r={6} /><Skel w={500} h={16} r={6} />
          </div>
        ) : (
          <>
            {/* Level + category tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '.9rem' }}>
              {course?.level && (
                <span style={{ background: lvl.bg, color: lvl.color, fontSize: '.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>
                  {course.level}
                </span>
              )}
              {course?.category && (
                <span style={{ background: 'rgba(141,198,63,0.15)', color: '#8DC63F', fontSize: '.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                  {course.category}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: 900, letterSpacing: '-.025em', marginBottom: '.75rem', lineHeight: 1.15 }}>
              {course?.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '.88rem', lineHeight: 1.65, maxWidth: 600, marginBottom: '1.25rem', fontWeight: 300 }}>
              {course?.description}
            </p>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
              <span>👤 {course?.trainer_name || 'IGo Faculty'}</span>
              <span>⏱ {course?.duration_hours}h</span>
              <span>📦 {totalModules} module{totalModules !== 1 ? 's' : ''}</span>
              {course?.prerequisites && course.prerequisites !== 'None' && (
                <span>📋 Req: {course.prerequisites}</span>
              )}
            </div>

            {/* Overall progress bar */}
            {totalModules > 0 && (
              <div style={{ maxWidth: 400 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '.7rem', fontWeight: 600 }}>Your Progress</span>
                  <span style={{ color: '#8DC63F', fontSize: '.7rem', fontWeight: 800 }}>{doneModules}/{totalModules} modules · {progressPct}%</span>
                </div>
                <div style={{ height: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#8DC63F,#4FA02E)', borderRadius: 10, transition: 'width .6s ease' }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Module list ── */}
      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.5rem', position: 'relative', zIndex: 1 }}>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem', marginTop: '1rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 2px 10px rgba(12,32,20,.05)' }}>
                <Skel w={44} h={44} r={44} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skel w={240} h={14} /><Skel w={100} h={11} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Section header */}
            <div style={{ background: 'white', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '.85rem', boxShadow: '0 2px 8px rgba(12,32,20,.05)', border: '1px solid #e8f0e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#0C2014', fontWeight: 800, fontSize: '.95rem', margin: 0 }}>Course Modules</h2>
              <span style={{ color: '#9ca3af', fontSize: '.75rem' }}>{totalModules} lesson{totalModules !== 1 ? 's' : ''}</span>
            </div>

            {totalModules === 0 && (
              <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(12,32,20,.05)', border: '1px solid #e8f0e8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🎬</div>
                <p style={{ color: '#9ca3af', fontWeight: 600, fontSize: '.9rem' }}>No modules published yet. Check back soon.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {course?.modules?.map((mod, i) => {
                const att = getAtt(mod.id);
                const pct = att?.watch_pct || 0;
                const done = att?.completed;
                const mins = mod.duration_secs ? Math.round(mod.duration_secs / 60) : null;

                return (
                  <Link
                    key={mod.id}
                    to={`/student/course/${courseId}/module/${mod.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: 'white', borderRadius: 14, padding: '1rem 1.25rem',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      boxShadow: '0 2px 8px rgba(12,32,20,.05)',
                      border: done ? '1.5px solid rgba(141,198,63,0.4)' : '1px solid #e8f0e8',
                      transition: 'transform .18s, box-shadow .18s, border-color .18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(12,32,20,.10)'; e.currentTarget.style.borderColor = '#8DC63F'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(12,32,20,.05)'; e.currentTarget.style.borderColor = done ? 'rgba(141,198,63,0.4)' : '#e8f0e8'; }}
                    >
                      {/* Step circle */}
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: done ? '1.1rem' : '.9rem',
                        background: done ? 'linear-gradient(135deg,#4FA02E,#8DC63F)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                        color: done ? 'white' : '#16402B',
                        boxShadow: done ? '0 4px 12px rgba(79,160,46,.35)' : 'none',
                      }}>
                        {done ? '✓' : i + 1}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#0C2014', fontWeight: 700, fontSize: '.9rem', marginBottom: '.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {mod.title}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '.7rem', marginBottom: pct > 0 ? '.4rem' : 0 }}>
                          {mins ? `${mins} min` : 'Video lecture'} · {done ? '✅ Completed' : pct > 0 ? `${pct}% watched` : 'Not started'}
                        </p>
                        {pct > 0 && (
                          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: done ? 'linear-gradient(90deg,#4FA02E,#8DC63F)' : 'linear-gradient(90deg,#DAA520,#F5D060)', borderRadius: 99, transition: 'width .5s ease' }} />
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div style={{ color: '#9ca3af', fontSize: '.85rem', flexShrink: 0 }}>›</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Assessment link if course has assessments */}
            {totalModules > 0 && (
              <Link to={`/student/course/${courseId}/assessments`} style={{ textDecoration: 'none' }}>
                <div style={{
                  marginTop: '1.25rem', background: 'linear-gradient(135deg,rgba(218,165,32,0.08),rgba(218,165,32,0.04))',
                  borderRadius: 14, padding: '1rem 1.25rem',
                  border: '1.5px solid rgba(218,165,32,0.3)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#DAA520'; e.currentTarget.style.background = 'rgba(218,165,32,0.10)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)'; e.currentTarget.style.background = 'linear-gradient(135deg,rgba(218,165,32,0.08),rgba(218,165,32,0.04))'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(218,165,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📝</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#0C2014', fontWeight: 700, fontSize: '.9rem', margin: 0 }}>Course Assessments</p>
                    <p style={{ color: '#9ca3af', fontSize: '.72rem', margin: 0 }}>View quizzes &amp; assignments for this course</p>
                  </div>
                  <span style={{ color: '#DAA520', fontSize: '.8rem' }}>›</span>
                </div>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

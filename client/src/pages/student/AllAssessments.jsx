import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import dayjs from 'dayjs';

/* ─── Design tokens ──────────────────────────────────────────── */
const COLOR = {
  navy:    '#0C2014',
  green:   '#16402B',
  mid:     '#235C39',
  gray50:  '#f6f8f5',
  gray200: '#dde5dd',
  gray400: '#9ca3af',
};

const STATUS = {
  graded:    { bg: '#dcfce7', color: '#15803d', dot: '#16a34a', label: 'Graded'    },
  submitted: { bg: '#fef9c3', color: '#854d0e', dot: '#d97706', label: 'Submitted' },
  pending:   { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8', label: 'Pending'   },
};

/* ─── SVG: timer icon ────────────────────────────────────────── */
const TimerIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function AllAssessments() {
  const { data: enrollments = [], isLoading: loadEnroll } = useQuery({
    queryKey: ['enrollments-my'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data.data || []),
  });

  const courseIds = enrollments.map(e => e.course_id);

  const { data: allAssessments = [], isLoading: loadAssess } = useQuery({
    queryKey: ['all-assessments', courseIds.join(',')],
    enabled: courseIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        courseIds.map(id => api.get('/assessments', { params: { course_id: id } }).then(r => r.data.data || []))
      );
      return results.flat();
    },
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => api.get('/assessments/submissions/my').then(r => r.data.data || []).catch(() => []),
  });

  const subMap   = Object.fromEntries(submissions.map(s => [s.assessment_id, s]));
  const isLoading = loadEnroll || loadAssess;
  const courseTitle = (id) => enrollments.find(e => e.course_id === id)?.course?.title || 'Course';

  return (
    <div style={{ minHeight: '100vh', background: COLOR.gray50, fontFamily: 'Sora, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg,${COLOR.navy} 0%,${COLOR.green} 70%,${COLOR.mid} 100%)`, padding: '1.5rem 2rem 3rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(141,198,63,.07)', pointerEvents: 'none' }} />
        <p style={{ color: 'rgba(141,198,63,.85)', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Student Portal</p>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '.2rem' }}>My Assessments</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem' }}>Quizzes and tests across all your enrolled courses</p>
      </div>

      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.6rem', position: 'relative', zIndex: 1 }}>

        {/* ── Summary chips ─────────────────────────────────────── */}
        {!isLoading && allAssessments.length > 0 && (
          <div style={{ display: 'flex', gap: '.65rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',     val: allAssessments.length,                                   bg: 'white',   color: COLOR.navy   },
              { label: 'Pending',   val: allAssessments.filter(a => !subMap[a.id]).length,         bg: '#fef9c3', color: '#92400e'   },
              { label: 'Submitted', val: submissions.filter(s => s.status !== 'graded').length,    bg: '#dbeafe', color: '#1e40af'   },
              { label: 'Graded',    val: submissions.filter(s => s.status === 'graded').length,    bg: '#dcfce7', color: '#15803d'   },
            ].map(c => (
              <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: '.45rem .9rem', border: `1px solid ${COLOR.gray200}`, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{ color: c.color, fontWeight: 800, fontSize: '.95rem', lineHeight: 1 }}>{c.val}</span>
                <span style={{ color: c.color, fontSize: '.68rem', fontWeight: 600, opacity: .8 }}>{c.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── List ──────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />)}
          </div>
        ) : allAssessments.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 18, padding: '3.5rem', textAlign: 'center', border: `1px solid ${COLOR.gray200}` }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📋</p>
            <p style={{ color: COLOR.navy, fontWeight: 700, fontSize: '1rem', marginBottom: '.35rem' }}>No assessments yet</p>
            <p style={{ color: COLOR.gray400, fontSize: '.82rem' }}>Assessments will appear here once your courses publish them.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {allAssessments.map(a => {
              const sub    = subMap[a.id];
              const status = sub ? (sub.status === 'graded' ? 'graded' : 'submitted') : 'pending';
              const st     = STATUS[status];
              const passed = sub?.score != null && a.pass_score != null && sub.score >= a.pass_score;
              const cTitle = courseTitle(a.course_id);

              return (
                <div key={a.id}
                  style={{ background: 'white', borderRadius: 14, border: `1px solid ${COLOR.gray200}`, boxShadow: '0 2px 10px rgba(13,38,25,.04)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', transition: 'box-shadow .15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,38,25,.09)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(13,38,25,.04)'}>

                  {/* Left accent bar */}
                  <div style={{ width: 3, height: 52, borderRadius: 99, background: status === 'graded' ? '#16a34a' : status === 'submitted' ? '#d97706' : COLOR.gray200, flexShrink: 0 }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Tags row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.35rem', flexWrap: 'wrap' }}>
                      {/* Course badge */}
                      <span style={{ background: '#f0fdf4', color: COLOR.green, fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: `1px solid #bbf7d0`, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cTitle}
                      </span>
                      {/* Status badge */}
                      <span style={{ background: st.bg, color: st.color, fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                        {st.label}
                      </span>
                      {/* Score badge */}
                      {sub?.score != null && (
                        <span style={{ background: passed ? '#dcfce7' : '#fee2e2', color: passed ? '#15803d' : '#dc2626', fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
                          {sub.score}/{a.max_score} {passed ? '✓ Pass' : '✗ Fail'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p style={{ color: COLOR.navy, fontWeight: 700, fontSize: '.9rem', marginBottom: '.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>

                    {/* Meta */}
                    <p style={{ color: COLOR.gray400, fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                      <span>{a.type === 'quiz' ? '📝 Quiz' : '📄 Assignment'}</span>
                      <span>· {a.max_score} pts</span>
                      {a.timer_mins && <span>· <TimerIcon />{a.timer_mins} min</span>}
                      {a.deadline && <span style={{ color: '#f59e0b' }}>· Due {dayjs(a.deadline).format('DD MMM YYYY')}</span>}
                    </p>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {a.type === 'quiz' && status === 'pending' ? (
                      <Link to={`/student/quiz/${a.id}`}
                        style={{ background: `linear-gradient(135deg,${COLOR.green},${COLOR.mid})`, color: 'white', borderRadius: 10, padding: '.5rem 1.1rem', fontSize: '.78rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}>
                        Start Quiz →
                      </Link>
                    ) : status === 'submitted' ? (
                      <Link to={`/student/quiz/${a.id}`}
                        style={{ background: '#fef9c3', color: '#92400e', borderRadius: 10, padding: '.5rem 1.1rem', fontSize: '.78rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                        View →
                      </Link>
                    ) : status === 'graded' ? (
                      <span style={{ color: passed ? '#15803d' : '#dc2626', fontSize: '.82rem', fontWeight: 800 }}>
                        {passed ? '🏆 Passed' : '↻ Retry'}
                      </span>
                    ) : (
                      <span style={{ color: COLOR.gray400, fontSize: '.82rem' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

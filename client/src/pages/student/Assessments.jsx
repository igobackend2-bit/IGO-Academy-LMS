/**
 * StudentAssessments — course assessment list
 */
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import dayjs from 'dayjs';

const TYPE_STYLE = {
  quiz:       { bg: '#dbeafe', color: '#1d4ed8', icon: '🧠' },
  assignment: { bg: '#fef3c7', color: '#b45309', icon: '📝' },
  project:    { bg: '#ede9fe', color: '#7c3aed', icon: '🗂️' },
};

export default function StudentAssessments() {
  const { courseId } = useParams();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', courseId],
    queryFn: () => api.get('/assessments', { params: { course_id: courseId } }).then(r => r.data.data),
  });
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data.data),
  });

  const now = dayjs();

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8f5' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0C2014 0%,#16402B 65%,#235C39 100%)',
        padding: '1.75rem 2rem 3rem', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:160, height:160, borderRadius:'50%', background:'rgba(141,198,63,0.07)', pointerEvents:'none' }} />
        <Link to={`/student/course/${courseId}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(141,198,63,0.9)', fontSize: '.78rem', fontWeight: 700,
          textDecoration: 'none', marginBottom: '1.25rem',
        }}>← Course</Link>
        <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.85rem)', fontWeight: 900, letterSpacing: '-.025em', marginBottom: '.5rem' }}>
          Assessments
        </h1>
        {course?.title && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '.82rem', fontWeight: 300 }}>{course.title}</p>
        )}
      </div>

      {/* ── List ── */}
      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.5rem', position: 'relative', zIndex: 1 }}>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 14, padding: '1.25rem', height: 90,
                boxShadow: '0 2px 10px rgba(12,32,20,.05)', border: '1px solid #e8f0e8',
                animation: 'shimmer 1.4s infinite linear',
                backgroundImage: 'linear-gradient(90deg,#e8eaed 25%,#f4f5f7 50%,#e8eaed 75%)',
                backgroundSize: '400% 100%',
              }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : !assessments?.length ? (
          <div style={{
            background: 'white', borderRadius: 16, padding: '3.5rem 2rem', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(12,32,20,.05)', border: '1px solid #e8f0e8', marginTop: '.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📋</div>
            <h2 style={{ color: '#0C2014', fontWeight: 700, fontSize: '1rem', marginBottom: '.4rem' }}>No Assessments Yet</h2>
            <p style={{ color: '#9ca3af', fontSize: '.85rem' }}>No assessments have been published for this course yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginTop: '.25rem' }}>
            {assessments.map(a => {
              const ts = TYPE_STYLE[a.type] ?? { bg: '#f3f4f6', color: '#6b7280', icon: '📄' };
              const isOverdue = a.deadline && dayjs(a.deadline).isBefore(now);
              const dueSoon   = a.deadline && dayjs(a.deadline).diff(now, 'hour') <= 24 && !isOverdue;

              return (
                <div key={a.id} style={{
                  background: 'white', borderRadius: 14, padding: '1.1rem 1.25rem',
                  boxShadow: '0 2px 8px rgba(12,32,20,.05)',
                  border: isOverdue ? '1.5px solid rgba(239,68,68,0.3)' : dueSoon ? '1.5px solid rgba(251,191,36,0.4)' : '1px solid #e8f0e8',
                  display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                }}>
                  {/* Type icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  }}>{ts.icon}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#0C2014', fontWeight: 700, fontSize: '.9rem', marginBottom: '.2rem' }}>{a.title}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.72rem', color: '#9ca3af' }}>
                      <span style={{ background: ts.bg, color: ts.color, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                        {a.type}
                      </span>
                      <span>{a.max_score} pts</span>
                      {a.timer_mins && <span>⏱ {a.timer_mins} min</span>}
                      {a.deadline && (
                        <span style={{ color: isOverdue ? '#ef4444' : dueSoon ? '#f59e0b' : '#9ca3af', fontWeight: isOverdue || dueSoon ? 700 : 500 }}>
                          {isOverdue ? '🔴 Overdue · ' : dueSoon ? '⚡ Due soon · ' : ''}
                          Due: {dayjs(a.deadline).format('DD MMM YYYY, HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  {a.type === 'quiz' && (
                    <Link
                      to={`/student/quiz/${a.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: isOverdue ? '#f3f4f6' : 'linear-gradient(135deg,#16402B,#235C39)',
                        color: isOverdue ? '#9ca3af' : 'white',
                        borderRadius: 9, padding: '.55rem 1.1rem',
                        fontWeight: 700, fontSize: '.78rem', textDecoration: 'none',
                        flexShrink: 0, pointerEvents: isOverdue ? 'none' : 'auto',
                        opacity: isOverdue ? 0.6 : 1,
                        transition: 'all .18s',
                      }}
                    >
                      {isOverdue ? 'Ended' : 'Start Quiz →'}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import dayjs from 'dayjs';

const GRAD = [
  'linear-gradient(135deg,#0C2014 0%,#1e4d2b 100%)',
  'linear-gradient(135deg,#1a3a2a 0%,#2d6b46 100%)',
  'linear-gradient(135deg,#0d2b18 0%,#235c3a 100%)',
  'linear-gradient(135deg,#152e1c 0%,#3a7a50 100%)',
  'linear-gradient(135deg,#0a2010 0%,#1e5c35 100%)',
];

const ICONS = ['🌱', '🌿', '🪴', '🌾', '🍀'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgFailed, setImgFailed] = useState({});   // track broken thumbnails

  useEffect(() => {
    Promise.all([
      api.get('/enrollments/my').then(r => r.data.data || []),
      api.get('/enrollment-requests/my').then(r => r.data.data || []).catch(() => []),
    ]).then(([enr, req]) => {
      setEnrollments(enr);
      setPendingReqs(req.filter(r => r.status === 'pending'));
    }).finally(() => setLoading(false));
  }, []);

  const daysLeft = (end) => dayjs(end).diff(dayjs(), 'day');

  // ── Redirect new students to Explore ──────────────────────────
  if (!loading && enrollments.length === 0) {
    return <Navigate to="/student/explore" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8f5' }}>

      {/* ── Compact header ──────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0C2014 0%,#16402B 70%,#235C39 100%)', padding: '1.5rem 2rem 2.8rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(141,198,63,0.07)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'rgba(141,198,63,0.85)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Welcome back</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.01em', marginBottom: '.2rem' }}>{user?.full_name} 👋</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.8rem' }}>Continue your agri-entrepreneurship journey</p>
          </div>
          <Link to="/student/explore"
            style={{ background: 'rgba(141,198,63,0.18)', border: '1.5px solid rgba(141,198,63,0.4)', color: '#8DC63F', borderRadius: 10, padding: '.5rem 1.1rem', fontSize: '.78rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Explore Courses
          </Link>
        </div>
      </div>

      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.5rem', position: 'relative', zIndex: 1 }}>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.85rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Enrolled',     val: enrollments.length,                               icon: '📚', accent: '#16402B', light: '#f0fdf4' },
            { label: 'Completed',    val: enrollments.filter(e => e.completed).length,       icon: '✅', accent: '#15803d', light: '#dcfce7' },
            { label: 'Certificates', val: enrollments.filter(e => e.certificate_issued).length, icon: '🏆', accent: '#b45309', light: '#fef3c7' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '1rem 1.1rem', border: '1px solid #e8f0e8', boxShadow: '0 2px 10px rgba(13,38,25,.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ color: s.accent, fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{loading ? '–' : s.val}</p>
                <p style={{ color: '#9ca3af', fontSize: '.68rem', fontWeight: 600, marginTop: 1 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pending request banner ────────────────────────────── */}
        {!loading && pendingReqs.length > 0 && (
          <div style={{ background: '#fefce8', borderRadius: 12, padding: '.85rem 1.1rem', border: '1.5px solid #fde68a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>⏳</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#92400e', fontWeight: 700, fontSize: '.82rem' }}>
                {pendingReqs.length} request{pendingReqs.length > 1 ? 's' : ''} awaiting admin approval
              </p>
              <p style={{ color: '#a16207', fontSize: '.72rem', marginTop: 2 }}>
                {pendingReqs.slice(0, 2).map(r => r.course_title).join(', ')}{pendingReqs.length > 2 ? ` +${pendingReqs.length - 2} more` : ''}
              </p>
            </div>
            <Link to="/student/explore" style={{ color: '#ca8a04', fontSize: '.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>View →</Link>
          </div>
        )}

        {/* ── My Courses ────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ color: '#0C2014', fontWeight: 800, fontSize: '1rem' }}>My Courses</h2>
          <span style={{ color: '#6b7280', fontSize: '.75rem' }}>{enrollments.length} course{enrollments.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.1rem' }}>
            {enrollments.map((en, idx) => {
              const days = daysLeft(en.end_date);
              const expiring = days <= 7 && days >= 0;
              const expired = days < 0;
              const hasThumbnail = en.course?.thumbnail_url && !imgFailed[en.id];

              return (
                <div key={en.id}
                  style={{ background: 'white', borderRadius: 16, border: '1px solid #e5ede5', boxShadow: '0 2px 14px rgba(13,38,25,.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,38,25,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(13,38,25,.06)'; }}>

                  {/* Card header — image OR gradient */}
                  <div style={{ position: 'relative', height: 110, overflow: 'hidden', background: hasThumbnail ? 'transparent' : GRAD[idx % GRAD.length] }}>
                    {hasThumbnail && (
                      <img
                        src={en.course.thumbnail_url}
                        alt={en.course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={() => setImgFailed(prev => ({ ...prev, [en.id]: true }))}
                      />
                    )}
                    {hasThumbnail && (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.45))' }} />
                    )}
                    {!hasThumbnail && (
                      <div style={{ padding: '1.1rem', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(141,198,63,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.5rem', fontSize: '1.1rem' }}>
                          {ICONS[idx % ICONS.length]}
                        </div>
                        <p style={{ color: 'white', fontWeight: 700, fontSize: '.88rem', lineHeight: 1.3, margin: 0 }}>{en.course?.title}</p>
                        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.68rem', marginTop: 2 }}>by {en.trainer?.full_name || 'IGo Faculty'}</p>
                      </div>
                    )}
                    {/* Expiry badges */}
                    {expiring && !expired && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: '#fbbf24', color: '#1c1917', fontSize: '.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>⚠ {days}d left</div>
                    )}
                    {expired && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: 'white', fontSize: '.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>Expired</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {/* Course title (only shown when thumbnail, since gradient header has it) */}
                    {hasThumbnail && (
                      <div>
                        <p style={{ color: '#0C2014', fontWeight: 700, fontSize: '.88rem', lineHeight: 1.3, marginBottom: 2 }}>{en.course?.title}</p>
                        <p style={{ color: '#9ca3af', fontSize: '.7rem' }}>by {en.trainer?.full_name || 'IGo Faculty'}</p>
                      </div>
                    )}

                    {/* Progress */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                        <span style={{ fontSize: '.7rem', color: '#9ca3af', fontWeight: 500 }}>Progress</span>
                        <span style={{ fontSize: '.7rem', color: en.progress > 0 ? '#16402B' : '#9ca3af', fontWeight: 700 }}>{en.progress || 0}%</span>
                      </div>
                      <div style={{ height: 5, background: '#f0f0f0', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${en.progress || 0}%`, background: 'linear-gradient(90deg,#8DC63F,#4FA02E)', borderRadius: 99, transition: 'width .6s ease' }} />
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: '#9ca3af' }}>
                      <span>Expires <strong style={{ color: expired ? '#dc2626' : '#4b5563' }}>{dayjs(en.end_date).format('DD MMM YY')}</strong></span>
                      {en.course?.duration_hours && <span>{en.course.duration_hours}h course</span>}
                    </div>

                    {/* CTA */}
                    <Link
                      to={expired ? '/course-expired' : `/student/course/${en.course_id}`}
                      style={{
                        display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 'auto',
                        background: expired ? '#f3f4f6' : 'linear-gradient(135deg,#16402B,#235C39)',
                        color: expired ? '#9ca3af' : 'white',
                        borderRadius: 9, padding: '.6rem', fontSize: '.8rem', fontWeight: 700,
                      }}>
                      {expired ? 'Access Ended' : en.progress > 0 ? 'Continue →' : 'Start Learning →'}
                    </Link>
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

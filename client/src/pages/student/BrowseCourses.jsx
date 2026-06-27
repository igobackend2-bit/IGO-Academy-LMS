import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

/* ─── Design tokens ──────────────────────────────────────────── */
const COLOR = {
  navy:    '#0C2014',
  green:   '#16402B',
  mid:     '#235C39',
  lime:    '#8DC63F',
  gray50:  '#f6f8f5',
  gray100: '#eef1ee',
  gray200: '#dde5dd',
  gray400: '#9ca3af',
  gray600: '#4b5563',
};

const CAT_STYLE = {
  'Horticulture':       { bg: '#dcfce7', color: '#15803d' },
  'Aquaculture':        { bg: '#dbeafe', color: '#1d4ed8' },
  'Agri-Business':      { bg: '#ffedd5', color: '#c2410c' },
  'Agri-Tech':          { bg: '#ede9fe', color: '#7c3aed' },
  'Organic Farming':    { bg: '#d1fae5', color: '#065f46' },
  'Livestock & Dairy':  { bg: '#fce7f3', color: '#9d174d' },
  'Farmpreneur Skills': { bg: '#fef9c3', color: '#854d0e' },
  'Irrigation & Water': { bg: '#cffafe', color: '#0e7490' },
  'Post-Harvest':       { bg: '#fee2e2', color: '#991b1b' },
  'Soil Science':       { bg: '#f5f0eb', color: '#78350f' },
};

/* ─── SVG Icons ──────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLOR.gray400} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ─── Step icons (SVG, no emoji) ─────────────────────────────── */
const StepIcons = [
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLOR.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLOR.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLOR.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLOR.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
];

const STEPS = [
  { num: 1, title: 'Browse',         desc: 'Explore all available courses'       },
  { num: 2, title: 'Request Access', desc: 'Send an enrollment request to admin'  },
  { num: 3, title: 'Admin Approves', desc: 'Admin reviews and grants you access'  },
  { num: 4, title: 'Start Learning', desc: 'Course appears in My Courses'         },
];

/* ─── Status chip ────────────────────────────────────────────── */
const STATUS_CHIP = {
  enrolled: { bg: '#16a34a', color: 'white', label: '✓ Enrolled'         },
  pending:  { bg: '#d97706', color: 'white', label: '⏳ Pending'          },
  rejected: { bg: '#dc2626', color: 'white', label: '✗ Rejected'          },
};

const LEAF = ['🌱','🌿','🪴','🌾','🍀'];

export default function BrowseCourses() {
  const qc = useQueryClient();
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('');
  const [requestModal, setRequestModal] = useState(null);
  const [message, setMessage]         = useState('');
  const [imgFailed, setImgFailed]     = useState({});

  /* ─── Data ─────────────────────────────────────────────────── */
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data || []),
  });
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments-my'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data.data || []),
  });
  const { data: myRequests = [] } = useQuery({
    queryKey: ['my-enrollment-requests'],
    queryFn: () => api.get('/enrollment-requests/my').then(r => r.data.data || []),
  });

  const requestMutation = useMutation({
    mutationFn: ({ course_id, student_message }) =>
      api.post('/enrollment-requests', { course_id, student_message }),
    onSuccess: () => {
      toast.success('Request sent! Admin will review shortly.');
      qc.invalidateQueries(['my-enrollment-requests']);
      setRequestModal(null); setMessage('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send request'),
  });

  const enrolledSet = new Set(enrollments.map(e => e.course_id));
  const reqMap      = Object.fromEntries(myRequests.map(r => [r.course_id, r]));
  const pendingCount = myRequests.filter(r => r.status === 'pending').length;

  const published = courses.filter(c => c.is_published !== false);
  const categories = [...new Set(published.map(c => c.category).filter(Boolean))];
  const filtered = published.filter(c => {
    const ms = !search || [c.title, c.description].join(' ').toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || c.category === catFilter;
    return ms && mc;
  });

  const getStatus = (id) => {
    if (enrolledSet.has(id)) return 'enrolled';
    return reqMap[id]?.status || null;
  };
  const catS = (cat) => CAT_STYLE[cat] || { bg: '#f0fdf4', color: COLOR.green };

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: COLOR.gray50, fontFamily: 'Sora, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg,${COLOR.navy} 0%,${COLOR.green} 70%,${COLOR.mid} 100%)`, padding: '1.5rem 2rem 3rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(141,198,63,.07)', pointerEvents: 'none' }} />
        <p style={{ color: 'rgba(141,198,63,.85)', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Student Portal</p>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '.2rem', letterSpacing: '-.01em' }}>Explore Courses</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem' }}>Browse and request access to available courses</p>
      </div>

      <div style={{ padding: '0 1.75rem 2.5rem', marginTop: '-1.6rem', position: 'relative', zIndex: 1 }}>

        {/* ── "How it works" stepper ─────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem 1.5rem', border: `1px solid ${COLOR.gray200}`, boxShadow: '0 2px 12px rgba(13,38,25,.05)', marginBottom: '1.1rem' }}>
          <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: COLOR.gray400, marginBottom: '1.25rem' }}>How enrollment works</p>

          {/* Stepper track */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}>
            {/* Connector line behind circles */}
            <div style={{ position: 'absolute', top: 16, left: '12.5%', right: '12.5%', height: 2, background: COLOR.gray200, zIndex: 0 }} />

            {STEPS.map((s, i) => {
              const Icon = StepIcons[i];
              return (
                <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.55rem', position: 'relative', zIndex: 1 }}>
                  {/* Number circle */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `linear-gradient(135deg,${COLOR.green},${COLOR.mid})`,
                    color: 'white', fontWeight: 800, fontSize: '.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(22,64,43,.25)',
                  }}>{s.num}</div>

                  {/* SVG icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon />
                  </div>

                  {/* Title */}
                  <p style={{ color: COLOR.navy, fontWeight: 700, fontSize: '.78rem', textAlign: 'center', lineHeight: 1.3, margin: 0 }}>{s.title}</p>
                  {/* Desc */}
                  <p style={{ color: COLOR.gray400, fontSize: '.68rem', textAlign: 'center', lineHeight: 1.4, margin: 0, padding: '0 .25rem' }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Pending banner ────────────────────────────────────── */}
        {pendingCount > 0 && (
          <div style={{ background: '#fffbeb', borderRadius: 12, padding: '.75rem 1rem', border: `1.5px solid #fde68a`, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1rem' }}>⏳</span>
            <p style={{ color: '#92400e', fontWeight: 700, fontSize: '.8rem', flex: 1 }}>
              {pendingCount} request{pendingCount > 1 ? 's' : ''} awaiting admin approval
            </p>
          </div>
        )}

        {/* ── Search + Filter bar ───────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 12, padding: '.85rem 1rem', border: `1px solid ${COLOR.gray200}`, boxShadow: '0 1px 6px rgba(13,38,25,.03)', marginBottom: '1.25rem', display: 'flex', gap: '.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 180, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '.7rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <SearchIcon />
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              style={{ width: '100%', border: `1.5px solid ${COLOR.gray200}`, borderRadius: 9, padding: '.48rem .75rem .48rem 2rem', fontSize: '.82rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: COLOR.gray50, color: COLOR.navy }}
            />
          </div>

          {/* Category */}
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ border: `1.5px solid ${COLOR.gray200}`, borderRadius: 9, padding: '.48rem .75rem', fontSize: '.82rem', outline: 'none', fontFamily: 'inherit', background: 'white', color: COLOR.gray600, minWidth: 150 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(search || catFilter) && (
            <button onClick={() => { setSearch(''); setCatFilter(''); }}
              style={{ border: `1.5px solid ${COLOR.gray200}`, borderRadius: 9, padding: '.48rem .85rem', fontSize: '.8rem', background: 'white', cursor: 'pointer', color: COLOR.gray400, fontWeight: 600 }}>
              ✕ Clear
            </button>
          )}

          <p style={{ color: COLOR.gray400, fontSize: '.72rem', marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Course Grid ───────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(265px,1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '3.5rem', textAlign: 'center', border: `1px solid ${COLOR.gray200}` }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '.6rem' }}>🔍</p>
            <p style={{ color: COLOR.navy, fontWeight: 700, fontSize: '1rem' }}>No courses found</p>
            <p style={{ color: COLOR.gray400, fontSize: '.82rem', marginTop: '.3rem' }}>Try a different search term or category.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(265px,1fr))', gap: '1rem' }}>
            {filtered.map((course, idx) => {
              const status = getStatus(course.id);
              const chip   = STATUS_CHIP[status];
              const cs     = catS(course.category);
              const hasThumbnail = course.thumbnail_url && !imgFailed[course.id];

              return (
                <div key={course.id}
                  style={{ background: 'white', borderRadius: 16, border: `1px solid ${COLOR.gray200}`, boxShadow: '0 2px 10px rgba(13,38,25,.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform .2s ease, box-shadow .2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(13,38,25,.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(13,38,25,.05)'; }}>

                  {/* Card thumbnail / gradient header */}
                  <div style={{ height: 96, position: 'relative', overflow: 'hidden', background: hasThumbnail ? '#f9fafb' : `linear-gradient(135deg,${COLOR.navy},${COLOR.mid})` }}>
                    {hasThumbnail && (
                      <>
                        <img src={course.thumbnail_url} alt={course.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={() => setImgFailed(p => ({ ...p, [course.id]: true }))} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.38))' }} />
                      </>
                    )}
                    {!hasThumbnail && (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', padding: '.85rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(141,198,63,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                          {LEAF[idx % 5]}
                        </div>
                      </div>
                    )}
                    {chip && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: chip.bg, color: chip.color, fontSize: '.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20, letterSpacing: '.04em' }}>
                        {chip.label}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                    {/* Category */}
                    {course.category && (
                      <span style={{ background: cs.bg, color: cs.color, fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, alignSelf: 'flex-start', letterSpacing: '.03em' }}>
                        {course.category}
                      </span>
                    )}

                    {/* Title + trainer */}
                    <div>
                      <p style={{ color: COLOR.navy, fontWeight: 700, fontSize: '.85rem', lineHeight: 1.35, marginBottom: 2 }}>{course.title}</p>
                      {course.trainer_name && <p style={{ color: COLOR.gray400, fontSize: '.68rem' }}>by {course.trainer_name}</p>}
                    </div>

                    {/* Description */}
                    {course.description && (
                      <p style={{ color: '#6b7280', fontSize: '.73rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </p>
                    )}

                    {/* Meta */}
                    {(course.duration_hours || course.level) && (
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '.67rem', color: COLOR.gray400 }}>
                        {course.duration_hours && <span>⏱ {course.duration_hours}h</span>}
                        {course.level && <span>📊 {course.level}</span>}
                      </div>
                    )}

                    {/* Action */}
                    <div style={{ marginTop: 'auto', paddingTop: '.35rem' }}>
                      {status === 'enrolled' ? (
                        <a href={`/student/course/${course.id}`}
                          style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: `linear-gradient(135deg,${COLOR.green},${COLOR.mid})`, color: 'white', borderRadius: 9, padding: '.52rem', fontSize: '.77rem', fontWeight: 700 }}>
                          Go to Course →
                        </a>
                      ) : status === 'pending' ? (
                        <button disabled style={{ display: 'block', width: '100%', background: COLOR.gray100, color: COLOR.gray400, borderRadius: 9, padding: '.52rem', fontSize: '.77rem', fontWeight: 700, border: 'none', cursor: 'not-allowed' }}>
                          Awaiting Approval…
                        </button>
                      ) : status === 'rejected' ? (
                        <button onClick={() => { setRequestModal(course); setMessage(''); }}
                          style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', borderRadius: 9, padding: '.52rem', fontSize: '.77rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                          Re-apply →
                        </button>
                      ) : (
                        <button onClick={() => { setRequestModal(course); setMessage(''); }}
                          style={{ display: 'block', width: '100%', background: `linear-gradient(135deg,${COLOR.navy},${COLOR.mid})`, color: 'white', borderRadius: 9, padding: '.52rem', fontSize: '.77rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                          Request Enrollment →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Request Modal ──────────────────────────────────────── */}
      {requestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.48)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setRequestModal(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', maxWidth: 450, width: '100%', boxShadow: '0 28px 72px rgba(0,0,0,.18)' }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
              <div>
                <h2 style={{ color: COLOR.navy, fontWeight: 800, fontSize: '1rem', marginBottom: '.2rem' }}>Request Enrollment</h2>
                <p style={{ color: COLOR.gray400, fontSize: '.78rem' }}>
                  {requestModal.title}
                  {requestModal.duration_hours && <span style={{ color: COLOR.gray400 }}> · {requestModal.duration_hours}h</span>}
                </p>
              </div>
              <button onClick={() => setRequestModal(null)}
                style={{ background: COLOR.gray100, border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: COLOR.gray400, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            </div>

            {/* Info strip */}
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '.6rem .85rem', marginBottom: '1rem', display: 'flex', gap: '.55rem', alignItems: 'flex-start', border: `1px solid #bbf7d0` }}>
              <svg width="14" height="14" style={{ marginTop: 1, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ color: '#15803d', fontSize: '.73rem', lineHeight: 1.5, margin: 0 }}>
                Your request will be reviewed. Once approved, the course appears in <strong>My Courses</strong>.
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: COLOR.gray600, marginBottom: '.3rem' }}>
                Message <span style={{ fontWeight: 400, color: COLOR.gray400 }}>(optional)</span>
              </label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Why are you interested in this course?"
                rows={3}
                style={{ width: '100%', border: `1.5px solid ${COLOR.gray200}`, borderRadius: 10, padding: '.55rem .8rem', fontSize: '.82rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: COLOR.navy }} />
            </div>

            <div style={{ display: 'flex', gap: '.6rem' }}>
              <button
                onClick={() => requestMutation.mutate({ course_id: requestModal.id, student_message: message })}
                disabled={requestMutation.isPending}
                style={{ flex: 1, background: `linear-gradient(135deg,${COLOR.green},${COLOR.mid})`, color: 'white', border: 'none', borderRadius: 10, padding: '.62rem', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', opacity: requestMutation.isPending ? .7 : 1 }}>
                {requestMutation.isPending ? 'Sending…' : 'Send Request'}
              </button>
              <button onClick={() => setRequestModal(null)}
                style={{ flex: 1, background: COLOR.gray100, color: COLOR.gray600, border: 'none', borderRadius: 10, padding: '.62rem', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

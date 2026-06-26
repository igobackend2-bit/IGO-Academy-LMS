import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const CATEGORIES = ['Horticulture', 'Aquaculture', 'Agri-Biz', 'Tech'];
const LEVELS     = ['beginner', 'intermediate', 'advanced'];

const LEVEL_COLOR = {
  beginner:     { bg: 'rgba(79,160,46,0.15)',  color: '#2d6a14' },
  intermediate: { bg: 'rgba(217,119,6,0.15)',  color: '#92400e' },
  advanced:     { bg: 'rgba(220,38,38,0.13)',  color: '#991b1b' },
};
const CAT_EMOJI = { Horticulture: '🌱', Aquaculture: '🐟', 'Agri-Biz': '📦', Tech: '💧' };

const EMPTY_FORM = {
  title: '', short_description: '', description: '',
  category: '', level: '', prerequisites: '',
  duration_hours: '', price: '', trainer_id: '',
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/courses'),
      api.get('/users?role=trainer&limit=200'),
    ]).then(([c, u]) => {
      setCourses(c.data.data || []);
      setUsers((u.data.data?.data || []).filter(u => u.role === 'trainer'));
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createCourse = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/courses', {
        ...form,
        duration_hours: Number(form.duration_hours),
        price: form.price !== '' ? Number(form.price) : undefined,
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0C2014 0%,#16402B 100%)', padding: '2rem 2.5rem 3.5rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(141,198,63,0.08)', pointerEvents: 'none' }} />
        <p style={{ color: 'rgba(141,198,63,0.9)', fontSize: '.75rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Content</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '.35rem' }}>Course Management</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.875rem' }}>Create and manage your agri-entrepreneurship courses</p>
      </div>

      <div style={{ padding: '0 2rem 2rem', marginTop: '-1.5rem' }}>
        {/* Toolbar */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid var(--gray-200)', boxShadow: '0 2px 12px rgba(13,38,25,.06)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>+ New Course</button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '16px' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
            {courses.map(c => (
              <div key={c.id} className="card-enter" style={{ background: 'white', borderRadius: '18px', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'all .22s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,38,25,.13), 0 0 0 1px rgba(79,160,46,.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>

                {/* Card header */}
                <div style={{ background: 'linear-gradient(135deg,#0C2014,#235C39)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(141,198,63,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                      {CAT_EMOJI[c.category] || '📚'}
                    </div>
                    <span style={{ background: c.is_active ? 'rgba(46,125,50,0.8)' : 'rgba(220,38,38,0.8)', color: 'white', fontSize: '.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '.3rem' }}>{c.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.75rem' }}>
                    {c.duration_hours}h · {c.trainer_name || 'No trainer'}
                  </p>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.25rem' }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                    {c.category && (
                      <span style={{ background: 'rgba(79,160,46,0.12)', color: '#2d6a14', fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        {c.category}
                      </span>
                    )}
                    {c.level && (
                      <span style={{ ...LEVEL_COLOR[c.level], fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        {c.level.charAt(0).toUpperCase() + c.level.slice(1)}
                      </span>
                    )}
                    {c.price > 0 && (
                      <span style={{ background: 'rgba(22,64,43,0.1)', color: '#16402B', fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'var(--gray-400)', fontSize: '.8rem', marginBottom: '1rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {c.short_description || c.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', gap: '.6rem' }}>
                    <Link to={`/admin/courses/${c.id}/edit`} className="btn-primary btn-sm" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', width: 'auto' }}>Manage</Link>
                    <span style={{ background: 'var(--navy-light)', color: 'var(--navy)', borderRadius: '8px', padding: '.4rem .75rem', fontSize: '.75rem', fontWeight: 600 }}>
                      {c.modules_count || 0} modules
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div style={{ gridColumn: '1/-1', background: 'white', borderRadius: '18px', padding: '3rem', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                <svg viewBox="0 0 80 100" width="72" style={{ margin: '0 auto 1rem', display: 'block' }}>
                  <line x1="40" y1="95" x2="40" y2="40" stroke="#2d6a14" strokeWidth="3" strokeLinecap="round" style={{ animation: 'cardSlideUp .8s ease both' }} />
                  <path d="M40 60 Q22 44 18 24 Q36 28 40 50" fill="#4FA02E" opacity=".9" style={{ animation: 'cardSlideUp .8s ease .2s both' }} />
                  <path d="M40 52 Q58 36 62 16 Q44 20 40 42" fill="#8DC63F" opacity=".85" style={{ animation: 'cardSlideUp .8s ease .4s both' }} />
                  <ellipse cx="40" cy="95" rx="6" ry="4" fill="#6B4423" opacity=".5" />
                </svg>
                <p style={{ color: 'var(--navy)', fontWeight: 700, fontSize: '1.05rem' }}>No courses yet</p>
                <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginTop: '.5rem' }}>Plant your first agri course to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box fade-in" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Create New Course</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <form onSubmit={createCourse}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                {error && <div className="alert-error">{error}</div>}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Course Title *</label>
                  <input className="igo-input" placeholder="e.g. Polyhouse Farming Mastery" value={form.title} onChange={e => set('title', e.target.value)} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tagline (short description)</label>
                  <input className="igo-input" placeholder="One-line course summary for the card" value={form.short_description} onChange={e => set('short_description', e.target.value)} maxLength={500} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Description</label>
                  <textarea className="igo-input" rows={3} placeholder="Detailed course overview…" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
                </div>

                {/* Row: category + level */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <select className="igo-select" value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">Select…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Level</label>
                    <select className="igo-select" value={form.level} onChange={e => set('level', e.target.value)}>
                      <option value="">Select…</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: duration + price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Duration (hours) *</label>
                    <input className="igo-input" type="number" min="1" placeholder="40" value={form.duration_hours} onChange={e => set('duration_hours', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price (₹)</label>
                    <input className="igo-input" type="number" min="0" placeholder="0 = free" value={form.price} onChange={e => set('price', e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Prerequisites</label>
                  <input className="igo-input" placeholder="e.g. Basic Botany, Intro to Agriculture" value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Assign Trainer</label>
                  <select className="igo-select" value={form.trainer_id} onChange={e => set('trainer_id', e.target.value)}>
                    <option value="">Select trainer…</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving}>{saving ? 'Creating…' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

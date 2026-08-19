/**
 * Admin — Batch management. Lets staff add/edit batch date, fee, mode and
 * registration status without a developer, per requirements doc §9.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const MODES = ['Online', 'Offline', 'Hybrid', 'Institutional / Corporate Training'];
const STATUSES = ['Open', 'Closed', 'Full'];
const EMPTY = { course_id: '', name: '', start_date: '', end_date: '', fee: '', mode: '', registration_status: 'Open', seats_available: '' };

const inputStyle = { width: '100%', padding: '.6rem .8rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.85rem' };
const labelStyle = { fontSize: '.72rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem', display: 'block' };

export default function AdminBatches() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', data? }
  const [form, setForm] = useState(EMPTY);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['batches-all'],
    queryFn: () => api.get('/batches/all').then(r => r.data.data || []),
  });
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-list-simple'],
    queryFn: () => api.get('/courses').then(r => r.data.data || []),
    enabled: !!modal,
  });

  const openCreate = () => { setForm(EMPTY); setModal({ mode: 'create' }); };
  const openEdit = (b) => {
    setForm({
      course_id: b.course_id, name: b.name,
      start_date: b.start_date ? dayjs(b.start_date).format('YYYY-MM-DD') : '',
      end_date: b.end_date ? dayjs(b.end_date).format('YYYY-MM-DD') : '',
      fee: b.fee ?? '', mode: b.mode ?? '',
      registration_status: b.registration_status, seats_available: b.seats_available ?? '',
    });
    setModal({ mode: 'edit', data: b });
  };

  const saveMutation = useMutation({
    mutationFn: (d) => modal.mode === 'edit'
      ? api.put(`/batches/${modal.data.id}`, d)
      : api.post('/batches', d).then(r => api.put(`/batches/${r.data.data.id}`, d)),
    onSuccess: () => { toast.success(modal.mode === 'edit' ? 'Batch updated' : 'Batch created'); qc.invalidateQueries(['batches-all']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/batches/${id}`),
    onSuccess: () => { toast.success('Batch deleted'); qc.invalidateQueries(['batches-all']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.course_id || !form.name.trim()) { toast.error('Course and batch name are required'); return; }
    saveMutation.mutate({
      ...form,
      fee: form.fee === '' ? null : Number(form.fee),
      seats_available: form.seats_available === '' ? null : Number(form.seats_available),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>Batches</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', margin: '.25rem 0 0' }}>Manage batch dates, fees, mode and registration status</p>
        </div>
        <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={openCreate}>+ New Batch</button>
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
      ) : batches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-400)' }}>No batches yet. Create one to show it under "Upcoming Programs" on the homepage.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', textAlign: 'left' }}>
                {['Course', 'Batch', 'Start', 'Fee', 'Mode', 'Status', 'Seats', ''].map(h => (
                  <th key={h} style={{ padding: '.75rem 1rem', fontWeight: 700, color: 'var(--gray-400)', fontSize: '.72rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '.75rem 1rem', fontWeight: 600 }}>{b.course_title}</td>
                  <td style={{ padding: '.75rem 1rem' }}>{b.name}</td>
                  <td style={{ padding: '.75rem 1rem' }}>{b.start_date ? dayjs(b.start_date).format('DD MMM YYYY') : '—'}</td>
                  <td style={{ padding: '.75rem 1rem' }}>{b.fee ? `₹${Number(b.fee).toLocaleString('en-IN')}` : '—'}</td>
                  <td style={{ padding: '.75rem 1rem' }}>{b.mode || '—'}</td>
                  <td style={{ padding: '.75rem 1rem' }}>
                    <span className="badge" style={{
                      background: b.registration_status === 'Open' ? '#dcfce7' : b.registration_status === 'Full' ? '#fef3c7' : '#fee2e2',
                      color: b.registration_status === 'Open' ? '#16a34a' : b.registration_status === 'Full' ? '#d97706' : '#dc2626',
                    }}>{b.registration_status}</span>
                  </td>
                  <td style={{ padding: '.75rem 1rem' }}>{b.seats_available ?? '—'}</td>
                  <td style={{ padding: '.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn-outline btn-sm" style={{ width: 'auto', marginRight: 8 }} onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn-outline btn-sm" style={{ width: 'auto', color: '#dc2626', borderColor: '#dc262640' }}
                      onClick={() => { if (confirm(`Delete batch "${b.name}"?`)) deleteMutation.mutate(b.id); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setModal(null)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 460, maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>{modal.mode === 'edit' ? 'Edit Batch' : 'New Batch'}</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Course *</label>
              <select style={inputStyle} value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} disabled={modal.mode === 'edit'} required>
                <option value="">Select a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Batch Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. September 2026 Batch" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" style={inputStyle} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input type="date" style={inputStyle} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Fee (₹)</label>
                <input type="number" style={inputStyle} value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="Leave blank to use course price" />
              </div>
              <div>
                <label style={labelStyle}>Seats Available</label>
                <input type="number" style={inputStyle} value={form.seats_available} onChange={e => setForm(f => ({ ...f, seats_available: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Mode</label>
                <select style={inputStyle} value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                  <option value="">Select mode</option>
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Registration Status</label>
                <select style={inputStyle} value={form.registration_status} onChange={e => setForm(f => ({ ...f, registration_status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" style={{ width: 'auto' }} disabled={saveMutation.isLoading}>
                {saveMutation.isLoading ? 'Saving…' : 'Save Batch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

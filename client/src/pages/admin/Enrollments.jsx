import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const STATUS_STYLE = {
  pending:  { bg: '#fef9c3', color: '#92400e', label: 'Pending'  },
  approved: { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

export default function AdminEnrollments() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('requests'); // 'requests' | 'active'
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '', start_date: '', end_date: '', paid_amount: 0 });
  const [reviewModal, setReviewModal] = useState(null); // { request, action: 'approve'|'reject' }
  const [reviewNote, setReviewNote] = useState('');
  const [approvalDates, setApprovalDates] = useState({ start_date: '', end_date: '', paid_amount: 0 });

  const { data: requests = [], isLoading: loadReq } = useQuery({
    queryKey: ['enrollment-requests'],
    queryFn: () => api.get('/enrollment-requests').then(r => r.data.data || []),
  });

  const { data: enrollData } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.get('/enrollments').then(r => r.data.data),
    enabled: tab === 'active',
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/users?role=student&limit=200').then(r => r.data.data?.data),
    enabled: showCreate,
  });
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data),
    enabled: showCreate,
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/enrollments', d),
    onSuccess: () => { toast.success('Student enrolled'); qc.invalidateQueries(['enrollments']); setShowCreate(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/enrollments/${id}`),
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries(['enrollments']); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/enrollment-requests/${id}/approve`, body),
    onSuccess: () => {
      toast.success('Approved — student enrolled');
      qc.invalidateQueries(['enrollment-requests']);
      qc.invalidateQueries(['enrollments']);
      setReviewModal(null); setReviewNote('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, admin_note }) => api.put(`/enrollment-requests/${id}/reject`, { admin_note }),
    onSuccess: () => {
      toast.success('Request rejected');
      qc.invalidateQueries(['enrollment-requests']);
      setReviewModal(null); setReviewNote('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '.55rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem',
      background: tab === id ? 'var(--navy)' : 'transparent',
      color: tab === id ? 'white' : 'var(--gray-500)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {label}
      {count > 0 && (
        <span style={{ background: tab === id ? 'rgba(255,255,255,.25)' : '#dc2626', color: 'white', borderRadius: 20, fontSize: '.65rem', padding: '1px 7px', fontWeight: 800 }}>{count}</span>
      )}
    </button>
  );

  return (
    <div className="p-8 page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-black text-igo-navy">Enrollments</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Enroll Student</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 12, padding: 4, marginBottom: '1.5rem', width: 'fit-content' }}>
        <TabBtn id="requests" label="Access Requests" count={pendingCount} />
        <TabBtn id="active" label="Active Enrollments" count={0} />
      </div>

      {/* Manual Enrollment Form */}
      {showCreate && (
        <div className="igo-card mb-6">
          <h3 className="font-bold text-igo-navy mb-4">New Enrollment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Student</label>
              <select className="igo-input" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Select Student</option>
                {students?.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Course</label>
              <select className="igo-input" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select Course</option>
                {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Start Date</label>
              <input type="date" className="igo-input" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">End Date</label>
              <input type="date" className="igo-input" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Amount Paid (₹)</label>
              <input type="number" className="igo-input" value={form.paid_amount} onChange={e => setForm({ ...form, paid_amount: parseFloat(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Enroll</button>
            <button onClick={() => setShowCreate(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Requests Tab ── */}
      {tab === 'requests' && (
        <div>
          {loadReq ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
            </div>
          ) : requests.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '.75rem' }}>📋</p>
              <p style={{ color: 'var(--navy)', fontWeight: 700 }}>No enrollment requests yet</p>
              <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginTop: '.4rem' }}>Students will appear here when they request course access.</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: '.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Student', 'Course', 'Requested', 'Message', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '.75rem 1rem', fontSize: '.72rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--gray-200)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => {
                    const ss = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '.85rem 1rem' }}>
                          <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.85rem' }}>{req.student_name}</p>
                          <p style={{ color: 'var(--gray-400)', fontSize: '.72rem' }}>{req.student_email}</p>
                        </td>
                        <td style={{ padding: '.85rem 1rem' }}>
                          <p style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '.85rem' }}>{req.course_title}</p>
                          {req.category && <p style={{ color: 'var(--gray-400)', fontSize: '.72rem' }}>{req.category}</p>}
                        </td>
                        <td style={{ padding: '.85rem 1rem', color: 'var(--gray-500)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                          {dayjs(req.requested_at).format('DD MMM YYYY')}
                        </td>
                        <td style={{ padding: '.85rem 1rem', color: 'var(--gray-600)', fontSize: '.78rem', maxWidth: 200 }}>
                          {req.student_message ? (
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.student_message}</span>
                          ) : <span style={{ color: 'var(--gray-300)' }}>—</span>}
                        </td>
                        <td style={{ padding: '.85rem 1rem' }}>
                          <span style={{ background: ss.bg, color: ss.color, fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{ss.label}</span>
                          {req.admin_note && req.status !== 'pending' && (
                            <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3 }}>"{req.admin_note}"</p>
                          )}
                        </td>
                        <td style={{ padding: '.85rem 1rem' }}>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                              <button
                                onClick={() => { setReviewModal({ request: req, action: 'approve' }); setReviewNote(''); setApprovalDates({ start_date: '', end_date: '', paid_amount: 0 }); }}
                                style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => { setReviewModal({ request: req, action: 'reject' }); setReviewNote(''); }}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                ✗ Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--gray-300)', fontSize: '.78rem' }}>
                              Reviewed {req.reviewed_by_name ? `by ${req.reviewed_by_name}` : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Active Enrollments Tab ── */}
      {tab === 'active' && (
        <div className="bg-white rounded-xl shadow-igo-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-igo-navy-light">
              <tr>
                {['Student', 'Course', 'Start', 'End', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-igo-navy uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollData?.data?.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{e.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.course_title}</td>
                  <td className="px-4 py-3 text-gray-500">{dayjs(e.start_date).format('DD MMM YYYY')}</td>
                  <td className="px-4 py-3 text-gray-500">{dayjs(e.end_date).format('DD MMM YYYY')}</td>
                  <td className="px-4 py-3 font-semibold">₹{e.paid_amount}</td>
                  <td className="px-4 py-3"><span className={e.is_expired ? 'badge-error' : 'badge-green'}>{e.is_expired ? 'Expired' : 'Active'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => removeMutation.mutate(e.id)} className="text-xs text-red-500 hover:underline">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setReviewModal(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 500, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <h2 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '.4rem' }}>
              {reviewModal.action === 'approve' ? '✓ Approve Enrollment' : '✗ Reject Request'}
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
              <strong>{reviewModal.request.student_name}</strong> → <strong>{reviewModal.request.course_title}</strong>
            </p>

            {reviewModal.action === 'approve' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Start Date</label>
                  <input type="date" value={approvalDates.start_date} onChange={e => setApprovalDates(d => ({ ...d, start_date: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3 }}>Leave blank for today</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>End Date</label>
                  <input type="date" value={approvalDates.end_date} onChange={e => setApprovalDates(d => ({ ...d, end_date: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3 }}>Default: 1 year</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Amount Paid (₹)</label>
                  <input type="number" value={approvalDates.paid_amount} onChange={e => setApprovalDates(d => ({ ...d, paid_amount: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>
                Note to student <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
              </label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                placeholder={reviewModal.action === 'approve' ? 'e.g. Welcome! Your access starts today.' : 'e.g. Please contact the academy to discuss payment.'}
                rows={2}
                style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.55rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              {reviewModal.action === 'approve' ? (
                <button
                  onClick={() => approveMutation.mutate({ id: reviewModal.request.id, admin_note: reviewNote, ...approvalDates })}
                  disabled={approveMutation.isPending}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#15803d,#166534)', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                  {approveMutation.isPending ? 'Approving…' : 'Approve & Enroll'}
                </button>
              ) : (
                <button
                  onClick={() => rejectMutation.mutate({ id: reviewModal.request.id, admin_note: reviewNote })}
                  disabled={rejectMutation.isPending}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                  {rejectMutation.isPending ? 'Rejecting…' : 'Reject Request'}
                </button>
              )}
              <button onClick={() => setReviewModal(null)}
                style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

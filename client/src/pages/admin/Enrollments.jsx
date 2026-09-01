import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const STATUS_STYLE = {
  pending:  { bg: '#fef9c3', color: '#92400e', label: 'Pending'  },
  approved: { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

const PAYMENT_METHOD_LABEL = {
  upi: 'UPI', bank_transfer: 'Bank Transfer', cash: 'Cash', other: 'Other',
};

const NEW_STUDENT_EMPTY = { full_name: '', email: '', phone: '', password: '' };

/** Random password for offline-paid students — excludes visually-ambiguous
 * characters (0/O, 1/l/I) since an admin usually reads this aloud or copies
 * it by hand to hand off to the student. */
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export default function AdminEnrollments() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('requests'); // 'requests' | 'active'
  const [showCreate, setShowCreate] = useState(false);
  const [enrollMode, setEnrollMode] = useState('existing'); // 'existing' | 'new'
  const [form, setForm] = useState({ student_id: '', course_id: '', start_date: '', end_date: '', paid_amount: 0 });
  const [newStudent, setNewStudent] = useState(NEW_STUDENT_EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState(null); // { full_name, email, password, course_title }
  const [reviewModal, setReviewModal] = useState(null); // { request, action: 'approve'|'reject' }
  const [reviewNote, setReviewNote] = useState('');
  const [approvalDates, setApprovalDates] = useState({ start_date: '', end_date: '', paid_amount: 0, batch_name: '' });

  const { data: requests = [], isLoading: loadReq, isError: reqError, refetch: refetchRequests } = useQuery({
    queryKey: ['enrollment-requests'],
    queryFn: () => api.get('/enrollment-requests').then(r => r.data.data || []),
  });

  const { data: enrollData } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.get('/enrollments').then(r => r.data.data),
    enabled: tab === 'active',
    staleTime: 0, // always refetch when switching to this tab
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

  // Offline-payment path: create the login account and enroll it in one go.
  // Two real API calls in sequence — POST /users already does everything an
  // account needs (hashing, mobile-auth sync, account-created email), and
  // POST /enrollments is the exact same call the "existing student" path
  // uses. If enrollment fails after the account was created, the account
  // is real and now findable in the Student dropdown — surfaced distinctly
  // below so the admin doesn't think nothing happened and re-submit blind.
  const createStudentAndEnrollMutation = useMutation({
    mutationFn: async () => {
      const { data: userRes } = await api.post('/users', {
        full_name: newStudent.full_name.trim(),
        email: newStudent.email.trim().toLowerCase(),
        phone: newStudent.phone.trim() || undefined,
        password: newStudent.password,
        role: 'student',
      });
      const student = userRes.data;
      try {
        await api.post('/enrollments', {
          student_id: student.id,
          course_id: form.course_id,
          start_date: form.start_date,
          end_date: form.end_date,
          paid_amount: form.paid_amount,
        });
      } catch (enrollErr) {
        const wrapped = new Error('ENROLL_FAILED');
        wrapped.studentCreated = student;
        wrapped.original = enrollErr;
        throw wrapped;
      }
      return student;
    },
    onSuccess: (student) => {
      const course = courses?.find(c => c.id === form.course_id);
      setCredentialsModal({
        full_name: student.full_name,
        email: student.email,
        password: newStudent.password,
        course_title: course?.title || '',
      });
      toast.success('Account created & enrolled');
      qc.invalidateQueries(['enrollments']);
      qc.invalidateQueries(['students']);
      setShowCreate(false);
      setEnrollMode('existing');
      setNewStudent(NEW_STUDENT_EMPTY);
      setForm({ student_id: '', course_id: '', start_date: '', end_date: '', paid_amount: 0 });
    },
    onError: (err) => {
      if (err.studentCreated) {
        qc.invalidateQueries(['students']);
        toast.error(
          `Account created for ${err.studentCreated.email}, but enrollment failed — switch to "Existing Student" and enroll them from there.`,
          { duration: 7000 }
        );
      } else {
        toast.error(err.response?.data?.message || 'Could not create account');
      }
    },
  });

  const handleEnrollSubmit = () => {
    if (enrollMode === 'new') {
      if (!newStudent.full_name.trim() || !newStudent.email.trim() || !newStudent.password) {
        toast.error('Full name, email and password are required');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(newStudent.email.trim())) {
        toast.error('Enter a valid email address');
        return;
      }
      if (newStudent.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (!form.course_id) {
        toast.error('Select a course');
        return;
      }
      createStudentAndEnrollMutation.mutate();
    } else {
      if (!form.student_id || !form.course_id) {
        toast.error('Select a student and a course');
        return;
      }
      createMutation.mutate(form);
    }
  };

  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/enrollments/${id}`),
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries(['enrollments']); },
  });

  // Fetch batches for the course being approved (to populate autocomplete)
  const { data: courseBatches = [] } = useQuery({
    queryKey: ['batches', reviewModal?.request?.course_id],
    queryFn: () => api.get(`/batches?course_id=${reviewModal.request.course_id}`).then(r => r.data.data || []),
    enabled: !!reviewModal?.request?.course_id && reviewModal?.action === 'approve',
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/enrollment-requests/${id}/approve`, body),
    onSuccess: () => {
      toast.success('Approved — student enrolled');
      qc.invalidateQueries(['enrollment-requests']);
      qc.invalidateQueries(['enrollments']);
      qc.invalidateQueries(['batches']);
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
        <TabBtn id="requests"  label="Payment Review"    count={pendingCount} />
        <TabBtn id="active"    label="Active Enrollments" count={0} />
      </div>

      {/* Manual Enrollment Form */}
      {showCreate && (
        <div className="igo-card mb-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
            <h3 className="font-bold text-igo-navy">New Enrollment</h3>
            <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 10, padding: 3 }}>
              <button type="button" onClick={() => setEnrollMode('existing')} style={{
                padding: '.4rem .9rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.78rem',
                background: enrollMode === 'existing' ? 'var(--navy)' : 'transparent',
                color: enrollMode === 'existing' ? 'white' : 'var(--gray-500)',
              }}>
                Existing Student
              </button>
              <button type="button" onClick={() => setEnrollMode('new')} style={{
                padding: '.4rem .9rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.78rem',
                background: enrollMode === 'new' ? 'var(--navy)' : 'transparent',
                color: enrollMode === 'new' ? 'white' : 'var(--gray-500)',
              }}>
                + New Student (Offline Payment)
              </button>
            </div>
          </div>

          {enrollMode === 'new' && (
            <div style={{ background: '#F0FBF0', border: '1px solid #cfe8bd', borderRadius: 10, padding: '.65rem .9rem', marginBottom: '1rem', fontSize: '.78rem', color: '#234023', lineHeight: 1.6 }}>
              Creates a brand-new login for someone who paid outside the website (cash, bank transfer, UPI) and enrolls
              them right away. You'll get their email and password afterward to hand off — the student can sign in immediately.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {enrollMode === 'existing' ? (
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Student</label>
                <select className="igo-input" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Select Student</option>
                  {students?.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.email}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Full Name</label>
                  <input className="igo-input" value={newStudent.full_name}
                    onChange={e => setNewStudent({ ...newStudent, full_name: e.target.value })}
                    placeholder="Student's full name" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Email</label>
                  <input type="email" className="igo-input" value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@example.com" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Phone <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
                  </label>
                  <input className="igo-input" value={newStudent.phone}
                    onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Password</label>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <input type={showPassword ? 'text' : 'password'} className="igo-input" style={{ flex: 1, minWidth: 0 }}
                      value={newStudent.password}
                      onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                      placeholder="At least 8 characters" />
                    <button type="button" onClick={() => setNewStudent({ ...newStudent, password: generatePassword() })}
                      className="btn-outline" style={{ width: 'auto', padding: '.5rem .7rem', fontSize: '.75rem', whiteSpace: 'nowrap' }}>
                      Generate
                    </button>
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      className="btn-outline" style={{ width: 'auto', padding: '.5rem .7rem', fontSize: '.75rem' }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </>
            )}
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
              <input type="text" inputMode="numeric" className="igo-input"
                value={form.paid_amount > 0 ? Number(form.paid_amount).toLocaleString('en-IN') : ''}
                placeholder="0"
                onChange={e => { const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setForm({ ...form, paid_amount: n }); }} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleEnrollSubmit}
              disabled={createMutation.isPending || createStudentAndEnrollMutation.isPending}
              className="btn-primary"
            >
              {enrollMode === 'new'
                ? (createStudentAndEnrollMutation.isPending ? 'Creating account…' : 'Create Account & Enroll')
                : (createMutation.isPending ? 'Enrolling…' : 'Enroll')}
            </button>
            <button onClick={() => { setShowCreate(false); setEnrollMode('existing'); setNewStudent(NEW_STUDENT_EMPTY); }} className="btn-outline">
              Cancel
            </button>
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
          ) : reqError ? (
            // Distinct from the empty state on purpose -- a failed fetch
            // rendering as "no requests" would hide real pending payments
            // from an admin instead of telling them something's wrong.
            <div style={{ background: '#fef2f2', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid #fecaca' }}>
              <p style={{ fontSize: '2rem', marginBottom: '.75rem' }}>⚠️</p>
              <p style={{ color: '#dc2626', fontWeight: 700 }}>Couldn't load payment requests</p>
              <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginTop: '.4rem' }}>There may be pending ones this page just failed to fetch.</p>
              <button onClick={() => refetchRequests()} className="btn-outline btn-sm" style={{ width: 'auto', marginTop: '1rem' }}>Retry</button>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '.75rem' }}>📋</p>
              <p style={{ color: 'var(--navy)', fontWeight: 700 }}>No payments waiting for review</p>
              <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginTop: '.4rem' }}>When a student buys a course, their payment details land here — approve to make them an active student and unlock the course on their dashboard.</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: '.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Student', 'Course', 'Requested', 'Message', 'Payment', 'Status', 'Actions'].map(h => (
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
                          {req.student_phone && <p style={{ color: 'var(--gray-400)', fontSize: '.72rem' }}>📞 {req.student_phone}</p>}
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
                        <td style={{ padding: '.85rem 1rem', fontSize: '.78rem' }}>
                          {req.claimed_amount ? (
                            <div>
                              <p style={{ fontWeight: 700, color: 'var(--navy)' }}>₹{Number(req.claimed_amount).toLocaleString('en-IN')}</p>
                              <span style={{ background: '#eef1ee', color: 'var(--gray-600)', fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                                {PAYMENT_METHOD_LABEL[req.payment_method] || req.payment_method}
                              </span>
                              {req.proof_url && (
                                <a href={req.proof_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#15803d', fontSize: '.72rem', fontWeight: 700, marginTop: 3 }}>
                                  View proof →
                                </a>
                              )}
                            </div>
                          ) : Number(req.course_price) > 0 ? (
                            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                              ⚠ No payment info
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gray-300)' }}>Free course</span>
                          )}
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
                                onClick={() => { setReviewModal({ request: req, action: 'approve' }); setReviewNote(''); setApprovalDates({ start_date: '', end_date: '', paid_amount: req.claimed_amount ? Number(req.claimed_amount) : 0, batch_name: '' }); }}
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

      {/* Credentials Modal — shown once after "New Student" account + enrollment succeed */}
      {credentialsModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) setCredentialsModal(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <h2 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '.4rem' }}>
              ✓ Account Created &amp; Enrolled
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
              <strong>{credentialsModal.full_name}</strong> is enrolled in <strong>{credentialsModal.course_title}</strong>.
              Share these login details with them — they can sign in right away:
            </p>
            <div style={{ background: '#F0FBF0', border: '1px solid #cfe8bd', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.05em', marginBottom: 2 }}>Login Email</p>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy)', fontSize: '.95rem', marginBottom: '.75rem', wordBreak: 'break-all' }}>
                {credentialsModal.email}
              </p>
              <p style={{ fontSize: '.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.05em', marginBottom: 2 }}>Password</p>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy)', fontSize: '.95rem' }}>
                {credentialsModal.password}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button
                onClick={() => {
                  const text = `Email: ${credentialsModal.email}\nPassword: ${credentialsModal.password}\nSign in at igoacademy.in/login`;
                  navigator.clipboard?.writeText(text);
                  toast.success('Copied to clipboard');
                }}
                style={{ flex: 1, background: 'linear-gradient(135deg,#15803d,#166534)', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                📋 Copy Credentials
              </button>
              <button onClick={() => setCredentialsModal(null)}
                style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Review Modal — rendered into document.body via portal to escape layout clipping */}
      {reviewModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) setReviewModal(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 500, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)', maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '.4rem' }}>
              {reviewModal.action === 'approve' ? '✓ Approve Enrollment' : '✗ Reject Request'}
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
              <strong>{reviewModal.request.student_name}</strong> → <strong>{reviewModal.request.course_title}</strong>
            </p>

            {reviewModal.request.claimed_amount ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '.75rem .9rem', marginBottom: '1.25rem', fontSize: '.8rem' }}>
                <p style={{ fontWeight: 700, color: '#15803d', marginBottom: '.3rem' }}>Payment claim</p>
                <p style={{ color: 'var(--navy)' }}>
                  ₹{Number(reviewModal.request.claimed_amount).toLocaleString('en-IN')} via {PAYMENT_METHOD_LABEL[reviewModal.request.payment_method] || reviewModal.request.payment_method}
                  {reviewModal.request.payment_reference && <> · Ref: <strong>{reviewModal.request.payment_reference}</strong></>}
                </p>
                {reviewModal.request.proof_url && (
                  <a href={reviewModal.request.proof_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#15803d', fontWeight: 700, marginTop: '.4rem' }}>
                    View payment screenshot →
                  </a>
                )}
              </div>
            ) : Number(reviewModal.request.course_price) > 0 ? (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '.75rem .9rem', marginBottom: '1.25rem', fontSize: '.8rem' }}>
                <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '.2rem' }}>⚠ No payment info submitted</p>
                <p style={{ color: '#92400e' }}>
                  This is a ₹{Number(reviewModal.request.course_price).toLocaleString('en-IN')} course, but the student didn't attach an amount, method, or reference. Confirm payment with them directly before approving.
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '.6rem .9rem', marginBottom: '1.25rem', fontSize: '.78rem', color: 'var(--gray-500)' }}>
                This is a free course — no payment required.
              </div>
            )}

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
                  <input type="text" inputMode="numeric"
                    value={approvalDates.paid_amount > 0 ? Number(approvalDates.paid_amount).toLocaleString('en-IN') : ''}
                    placeholder="0"
                    onChange={e => { const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setApprovalDates(d => ({ ...d, paid_amount: n })); }}
                    style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>
                    Batch <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
                  </label>
                  <input
                    list="batch-options"
                    value={approvalDates.batch_name}
                    onChange={e => setApprovalDates(d => ({ ...d, batch_name: e.target.value }))}
                    placeholder="e.g. Batch 1 · Jun 2026"
                    style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <datalist id="batch-options">
                    {courseBatches.map(b => <option key={b.id} value={b.name} />)}
                  </datalist>
                  <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3 }}>
                    {courseBatches.length > 0 ? `${courseBatches.length} existing batch${courseBatches.length > 1 ? 'es' : ''} · type new to create` : 'Type a name to create a new batch'}
                  </p>
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
        </div>,
        document.body
      )}
    </div>
  );
}

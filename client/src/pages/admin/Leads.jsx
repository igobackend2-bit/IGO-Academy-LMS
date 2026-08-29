/**
 * Admin — Enquiries. Per requirements doc §8.
 * Two submission channels feed this page: the website contact/course-page
 * form (the `enquiries` table — general interest, no course commitment yet)
 * and the mobile app's enrollment-interest form (`app_enrollment_leads` —
 * usually already names a program, and approving one creates the student's
 * LMS account + enrollment directly). They used to live on separate pages
 * (this one, and a tab buried in Enrollments); tabbed together here so an
 * admin checks one place for "who do I need to follow up with".
 * Web status flow: New → Contacted → Interested → Follow-up → Enrolled → Not Interested → Closed
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// Simple binary review, same shape as the App Enquiries tab: New (awaiting
// review) -> Accepted / Rejected. Backed by the existing enquiries.status
// enum's 'Interested' / 'Not Interested' values (no migration needed) --
// just displayed under friendlier names, matching the "just accept it,
// don't need the whole New/Contacted/Follow-up/Enrolled/Closed funnel" ask.
// A handful of older rows may still carry one of those retired values
// (Contacted, Follow-up, Enrolled, Closed) from before this simplification
// — WEB_STATUS_LABEL/COLOR fall back to the raw string for those so they
// still render sensibly instead of showing "undefined".
const ACCEPT_STATUS = 'Interested';
const REJECT_STATUS = 'Not Interested';
const WEB_STATUS_LABEL = { New: 'New', Interested: 'Accepted', 'Not Interested': 'Rejected' };
const STATUS_COLOR = {
  New: { bg: '#dbeafe', color: '#1d4ed8' },
  Interested: { bg: '#dcfce7', color: '#15803d' },
  'Not Interested': { bg: '#fee2e2', color: '#dc2626' },
};

const APP_STATUS_STYLE = {
  pending:  { bg: '#fef9c3', color: '#92400e', label: 'Pending'  },
  approved: { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

export default function AdminLeads() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('web'); // 'web' | 'app'

  // ── Web enquiries ──
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['enquiries', filter],
    queryFn: () => api.get(`/enquiries${filter ? `?status=${filter}` : ''}`).then(r => r.data.data || []),
    enabled: tab === 'web',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/enquiries/${id}`, body),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries(['enquiries']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  // ── App enquiries (from the Flutter app's enrollment-interest form) ──
  // Approve just confirms interest + gets them a login; course choice and
  // payment happen afterwards through the normal enrollment-request flow
  // (courses page → pick a course → pay), reviewed separately in
  // Enrollments → Access Requests. No course picker belongs here.
  const [leadModal, setLeadModal] = useState(null); // { lead, action: 'approve'|'reject' }
  const [leadNote, setLeadNote] = useState('');

  const { data: appLeads = [], isLoading: loadLeads } = useQuery({
    queryKey: ['app-leads'],
    queryFn: () => api.get('/app-leads').then(r => r.data.data || []),
    enabled: tab === 'app',
  });
  const appLeadPendingCount = appLeads.filter(l => l.status === 'pending').length;

  const appLeadApproveMutation = useMutation({
    mutationFn: ({ id, admin_note }) => api.put(`/app-leads/${id}/approve`, { admin_note }),
    onSuccess: (res) => {
      const msg = res.data.message || 'Approved';
      toast.success(msg);
      qc.invalidateQueries(['app-leads']);
      qc.invalidateQueries(['admin-pending-counts']);
      setLeadModal(null); setLeadNote('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const appLeadRejectMutation = useMutation({
    mutationFn: ({ id, admin_note }) => api.put(`/app-leads/${id}/reject`, { admin_note }),
    onSuccess: () => {
      toast.success('Lead rejected');
      qc.invalidateQueries(['app-leads']);
      qc.invalidateQueries(['admin-pending-counts']);
      setLeadModal(null); setLeadNote('');
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

  const newWebCount = leads.filter(l => l.status === 'New').length;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>Enquiries</h1>
        <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', margin: '.25rem 0 0' }}>Everyone who's shown interest — via the website contact form or the app — in one place</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 12, padding: 4, marginBottom: '1.5rem', width: 'fit-content' }}>
        <TabBtn id="web" label="🌐 Web Enquiries" count={tab === 'web' ? newWebCount : 0} />
        <TabBtn id="app" label="📱 App Enquiries" count={appLeadPendingCount} />
      </div>

      {/* ── Web Enquiries Tab ── */}
      {tab === 'web' && (
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[['', 'All'], ['New', 'New'], [ACCEPT_STATUS, 'Accepted'], [REJECT_STATUS, 'Rejected']].map(([value, label]) => (
              <button
                key={value || 'all'}
                onClick={() => setFilter(value)}
                className={filter === value ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                style={{ width: 'auto' }}
              >{label}</button>
            ))}
          </div>

          {isLoading ? (
            <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
              <p style={{ color: 'var(--gray-400)' }}>No enquiries {filter ? `marked "${WEB_STATUS_LABEL[filter] || filter}"` : 'yet'}.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {leads.map(lead => (
                <div key={lead.id} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)', padding: '1.1rem 1.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.3rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{lead.name}</span>
                        <span className="badge" style={{ background: STATUS_COLOR[lead.status]?.bg || 'var(--gray-100)', color: STATUS_COLOR[lead.status]?.color || 'var(--gray-400)', fontSize: '.68rem' }}>{WEB_STATUS_LABEL[lead.status] || lead.status}</span>
                      </div>
                      <div style={{ fontSize: '.82rem', color: 'var(--gray-400)' }}>
                        {lead.phone} {lead.email ? `· ${lead.email}` : ''} {lead.location ? `· ${lead.location}` : ''}
                      </div>
                      {lead.course_interested && (
                        <div style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginTop: '.3rem' }}>
                          Interested in: <strong>{lead.course_interested}</strong>
                          {lead.candidate_type ? ` · ${lead.candidate_type}` : ''}
                          {lead.preferred_mode ? ` · ${lead.preferred_mode}` : ''}
                        </div>
                      )}
                      {lead.message && <div style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginTop: '.3rem', fontStyle: 'italic' }}>"{lead.message}"</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
                      <span style={{ fontSize: '.72rem', color: 'var(--gray-400)' }}>{dayjs(lead.created_at).format('DD MMM YYYY, h:mm A')}</span>
                      {lead.status === 'New' ? (
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          <button
                            onClick={() => updateMutation.mutate({ id: lead.id, status: ACCEPT_STATUS })}
                            style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => updateMutation.mutate({ id: lead.id, status: REJECT_STATUS })}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            ✗ Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateMutation.mutate({ id: lead.id, status: 'New' })}
                          style={{ background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: '.72rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                          Undo — reopen
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: '.75rem', cursor: 'pointer', marginTop: '.6rem', padding: 0 }}
                  >
                    {expanded === lead.id ? '− Hide note' : '+ Add / view internal note'}
                  </button>
                  {expanded === lead.id && (
                    <textarea
                      defaultValue={lead.admin_note || ''}
                      placeholder="Internal note — not visible to the lead"
                      onBlur={e => updateMutation.mutate({ id: lead.id, admin_note: e.target.value })}
                      style={{ width: '100%', marginTop: '.5rem', padding: '.6rem .8rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.82rem', minHeight: 60, boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── App Enquiries Tab ── */}
      {tab === 'app' && (
        <div>
          {loadLeads ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
            </div>
          ) : appLeads.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '.75rem' }}>📱</p>
              <p style={{ color: 'var(--navy)', fontWeight: 700 }}>No app enquiries yet</p>
              <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginTop: '.4rem' }}>Enquiries submitted via the IGO Academy mobile app will appear here.</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: '.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Name', 'Contact', 'Program', 'Details', 'Submitted', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '.75rem 1rem', fontSize: '.72rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--gray-200)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appLeads.map(lead => {
                    const ss = APP_STATUS_STYLE[lead.status] || APP_STATUS_STYLE.pending;
                    return (
                      <tr key={lead.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '.85rem 1rem' }}>
                          <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.85rem' }}>{lead.full_name}</p>
                        </td>
                        <td style={{ padding: '.85rem 1rem' }}>
                          <p style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '.82rem' }}>{lead.email}</p>
                          <p style={{ color: 'var(--gray-400)', fontSize: '.72rem' }}>{lead.phone}{lead.alt_phone ? ` / ${lead.alt_phone}` : ''}</p>
                        </td>
                        <td style={{ padding: '.85rem 1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '.82rem' }}>
                          {lead.program_of_interest}
                        </td>
                        <td style={{ padding: '.85rem 1rem', color: 'var(--gray-600)', fontSize: '.78rem', maxWidth: 180 }}>
                          {lead.additional_details
                            ? <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.additional_details}</span>
                            : <span style={{ color: 'var(--gray-300)' }}>—</span>}
                        </td>
                        <td style={{ padding: '.85rem 1rem', color: 'var(--gray-500)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                          {dayjs(lead.created_at).format('DD MMM YYYY')}
                        </td>
                        <td style={{ padding: '.85rem 1rem' }}>
                          <span style={{ background: ss.bg, color: ss.color, fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{ss.label}</span>
                          {lead.admin_note && lead.status !== 'pending' && (
                            <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3 }}>"{lead.admin_note}"</p>
                          )}
                        </td>
                        <td style={{ padding: '.85rem 1rem' }}>
                          {lead.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                              <button
                                onClick={() => { setLeadModal({ lead, action: 'approve' }); setLeadNote(''); }}
                                style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => { setLeadModal({ lead, action: 'reject' }); setLeadNote(''); }}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                ✗ Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--gray-300)', fontSize: '.78rem' }}>
                              Reviewed {lead.reviewed_by_name ? `by ${lead.reviewed_by_name}` : ''}
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

      {/* App Enquiry Review Modal */}
      {leadModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) setLeadModal(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 520, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)', maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '.25rem' }}>
              {leadModal.action === 'approve' ? '✓ Approve App Enquiry' : '✗ Reject App Enquiry'}
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '.83rem', marginBottom: '1.25rem' }}>
              <strong>{leadModal.lead.full_name}</strong> · {leadModal.lead.email} · {leadModal.lead.phone}
              <br /><span style={{ color: 'var(--gray-400)' }}>Interested in: <strong>{leadModal.lead.program_of_interest}</strong></span>
            </p>

            {leadModal.action === 'approve' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '.75rem', marginBottom: '1.25rem', fontSize: '.78rem', color: '#15803d' }}>
                <strong>On approval:</strong> an LMS account will be created for them (if new — a temp password will be shown, share it with the student). No course is assigned here — they'll pick a course and submit payment themselves, which you'll review in Enrollments → Access Requests.
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>
                Note to student <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
              </label>
              <textarea value={leadNote} onChange={e => setLeadNote(e.target.value)}
                placeholder={leadModal.action === 'approve' ? 'e.g. Welcome! Your access starts today.' : 'e.g. Please contact the academy for more details.'}
                rows={2}
                style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.55rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              {leadModal.action === 'approve' ? (
                <button
                  onClick={() => appLeadApproveMutation.mutate({ id: leadModal.lead.id, admin_note: leadNote })}
                  disabled={appLeadApproveMutation.isPending}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#15803d,#166534)', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                  {appLeadApproveMutation.isPending ? 'Approving…' : 'Approve Enquiry'}
                </button>
              ) : (
                <button
                  onClick={() => appLeadRejectMutation.mutate({ id: leadModal.lead.id, admin_note: leadNote })}
                  disabled={appLeadRejectMutation.isPending}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                  {appLeadRejectMutation.isPending ? 'Rejecting…' : 'Reject Enquiry'}
                </button>
              )}
              <button onClick={() => setLeadModal(null)}
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

/**
 * Executive — My Leads. The only page an executive sees: the leads an
 * admin assigned to them (Admin → Lead Assign), with a call button and a
 * simple way to record what happened — status, which course the lead
 * picked (if any), and a note. Scoped server-side to GET /enquiries/my and
 * PATCH /enquiries/:id (which rejects updates to a lead not assigned to
 * this executive), so there's no way to see or touch anyone else's leads.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const STATUS_OPTIONS = ['New', 'Contacted', 'Interested', 'Follow-up', 'Enrolled', 'Not Interested', 'Closed'];
const STATUS_COLOR = {
  New:            { bg: '#dbeafe', color: '#1d4ed8' },
  Contacted:      { bg: '#e0e7ff', color: '#4338ca' },
  Interested:     { bg: '#fef9c3', color: '#92400e' },
  'Follow-up':    { bg: '#fed7aa', color: '#9a3412' },
  Enrolled:       { bg: '#dcfce7', color: '#15803d' },
  'Not Interested': { bg: '#fee2e2', color: '#dc2626' },
  Closed:         { bg: '#f3f4f6', color: '#6b7280' },
};

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'white', border: `1.5px solid ${color}22`, borderRadius: 16, padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function ExecutiveMyLeads() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null); // the lead being updated
  const [form, setForm] = useState({ status: '', course_interested: '', admin_note: '' });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['my-leads'],
    queryFn: () => api.get('/enquiries/my').then(r => r.data.data || []),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/enquiries/${id}`, body),
    onSuccess: () => {
      toast.success('Lead updated');
      qc.invalidateQueries(['my-leads']);
      setEditing(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const openEdit = (lead) => {
    setEditing(lead);
    setForm({ status: lead.status, course_interested: lead.course_interested || '', admin_note: lead.admin_note || '' });
  };

  const filtered = statusFilter ? leads.filter(l => l.status === statusFilter) : leads;

  const counts = {
    total: leads.length,
    contacted: leads.filter(l => l.status !== 'New').length,
    interested: leads.filter(l => l.status === 'Interested' || l.status === 'Enrolled').length,
    enrolled: leads.filter(l => l.status === 'Enrolled').length,
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>My Leads</h1>
        <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', margin: '.25rem 0 0' }}>
          Leads assigned to you — call, update status, and note what they said.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Assigned to Me" value={counts.total} color="var(--navy)" />
        <StatCard label="Contacted"      value={counts.contacted} color="#4338ca" />
        <StatCard label="Interested"     value={counts.interested} color="#92400e" />
        <StatCard label="Enrolled / Paid" value={counts.enrolled} color="#15803d" />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            style={{ width: 'auto' }}
          >{s || 'All'}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📇</p>
          <p style={{ color: 'var(--gray-400)' }}>
            {leads.length === 0 ? 'No leads assigned to you yet.' : `No leads marked "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {filtered.map(lead => (
            <div key={lead.id} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)', padding: '1.1rem 1.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{lead.name}</span>
                    <span style={{ background: STATUS_COLOR[lead.status]?.bg || 'var(--gray-100)', color: STATUS_COLOR[lead.status]?.color || 'var(--gray-500)', fontSize: '.68rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>
                      {lead.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--gray-400)' }}>
                    <a href={`tel:${lead.phone}`} style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>📞 {lead.phone}</a>
                    {lead.email ? ` · ${lead.email}` : ''} {lead.location ? ` · ${lead.location}` : ''}
                  </div>
                  {lead.course_interested && (
                    <div style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginTop: '.3rem' }}>
                      Course: <strong>{lead.course_interested}</strong>
                    </div>
                  )}
                  {lead.message && <div style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginTop: '.3rem', fontStyle: 'italic' }}>Original message: "{lead.message}"</div>}
                  {lead.admin_note && <div style={{ fontSize: '.8rem', color: 'var(--navy)', marginTop: '.3rem' }}>Your note: "{lead.admin_note}"</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
                  <span style={{ fontSize: '.7rem', color: 'var(--gray-400)' }}>
                    {lead.last_contacted_at ? `Last called ${dayjs(lead.last_contacted_at).format('DD MMM, h:mm A')}` : 'Not called yet'}
                  </span>
                  <button
                    onClick={() => openEdit(lead)}
                    style={{ background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, padding: '.4rem .9rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {editing && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 460, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <h2 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '.25rem' }}>Update Lead</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
              <strong>{editing.name}</strong> · <a href={`tel:${editing.phone}`} style={{ color: '#15803d' }}>{editing.phone}</a>
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3 }}>
                Mark <strong>Enrolled</strong> once they've paid — the admin sees this update immediately.
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>
                Course selected <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(if interested)</span>
              </label>
              <input value={form.course_interested} onChange={e => setForm(f => ({ ...f, course_interested: e.target.value }))}
                placeholder="e.g. Microgreens Production & Entrepreneurship Program"
                style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.5rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>
                Call notes <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
              </label>
              <textarea value={form.admin_note} onChange={e => setForm(f => ({ ...f, admin_note: e.target.value }))}
                placeholder="e.g. Wants to join next batch, will call back Friday"
                rows={3}
                style={{ width: '100%', border: '1.5px solid var(--gray-200)', borderRadius: 9, padding: '.55rem .75rem', fontSize: '.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button
                onClick={() => updateMutation.mutate({ id: editing.id, ...form })}
                disabled={updateMutation.isPending}
                style={{ flex: 1, background: 'linear-gradient(135deg,#15803d,#166534)', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                {updateMutation.isPending ? 'Saving…' : 'Save Update'}
              </button>
              <button onClick={() => setEditing(null)}
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

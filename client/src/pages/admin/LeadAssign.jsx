/**
 * Admin — Lead Assign. Upload leads (CSV or one at a time) and hand them
 * off to an IGO Academy Executive, who calls them and updates status from
 * their own dashboard (see pages/executive/MyLeads.jsx). Separate from the
 * Enquiries page (/admin/leads) — that page is for admin to review/accept
 * website & app submissions; this one is the assignment + oversight layer
 * once a lead exists, regardless of where it came from (same `enquiries`
 * table, just a different lens: "who owns this lead and what have they
 * done with it" instead of "is this a real enquiry".
 */
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const STATUS_COLOR = {
  New:            { bg: '#dbeafe', color: '#1d4ed8' },
  Contacted:      { bg: '#e0e7ff', color: '#4338ca' },
  Interested:     { bg: '#fef9c3', color: '#92400e' },
  'Follow-up':    { bg: '#fed7aa', color: '#9a3412' },
  Enrolled:       { bg: '#dcfce7', color: '#15803d' },
  'Not Interested': { bg: '#fee2e2', color: '#dc2626' },
  Closed:         { bg: '#f3f4f6', color: '#6b7280' },
};
const ALL_STATUSES = ['New', 'Contacted', 'Interested', 'Follow-up', 'Enrolled', 'Not Interested', 'Closed'];

const EMPTY_LEAD = { name: '', phone: '', email: '', course_interested: '', location: '', message: '' };

export default function AdminLeadAssign() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [assignedFilter, setAssignedFilter] = useState(''); // '' | 'unassigned' | executiveId
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkAssignTo, setBulkAssignTo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState(EMPTY_LEAD);
  const [uploading, setUploading] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads-assign', assignedFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (assignedFilter) params.set('assigned_to', assignedFilter);
      if (statusFilter) params.set('status', statusFilter);
      return api.get(`/enquiries${params.toString() ? `?${params}` : ''}`).then(r => r.data.data || []);
    },
  });

  const { data: executives = [] } = useQuery({
    queryKey: ['executives'],
    queryFn: () => api.get('/users?role=executive&limit=200').then(r => r.data.data?.data || []),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assigned_to }) => api.patch(`/enquiries/${id}/assign`, { assigned_to }),
    onSuccess: () => { toast.success('Assignment updated'); qc.invalidateQueries(['leads-assign']); qc.invalidateQueries(['admin-pending-counts']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const bulkAssignMutation = useMutation({
    mutationFn: ({ ids, assigned_to }) => api.patch('/enquiries/bulk-assign', { ids, assigned_to }),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Assigned');
      setSelected(new Set());
      setBulkAssignTo('');
      qc.invalidateQueries(['leads-assign']);
      qc.invalidateQueries(['admin-pending-counts']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const addLeadMutation = useMutation({
    mutationFn: (d) => api.post('/enquiries/admin-create', d),
    onSuccess: () => {
      toast.success('Lead added');
      setShowAddModal(false);
      setNewLead(EMPTY_LEAD);
      qc.invalidateQueries(['leads-assign']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Could not add lead'),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data: res } = await api.post('/enquiries/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.message || 'Imported');
      qc.invalidateQueries(['leads-assign']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelected(prev => prev.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
  };

  const unassignedCount = leads.filter(l => !l.assigned_to).length;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>Lead Assign</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', margin: '.25rem 0 0' }}>
            Upload leads and hand them to an executive to call — track status as they update it.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} style={{ display: 'none' }} />
          <button className="btn-outline btn-sm" style={{ width: 'auto' }} disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? 'Uploading…' : '⬆ Upload CSV'}
          </button>
          <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowAddModal(true)}>
            + Add Lead
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-dark)' }}>{leads.length}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', fontWeight: 600 }}>Total Leads (filtered)</div>
        </div>
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{unassignedCount}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', fontWeight: 600 }}>Unassigned</div>
        </div>
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{leads.filter(l => l.status === 'Enrolled').length}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', fontWeight: 600 }}>Enrolled / Paid</div>
        </div>
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-dark)' }}>{executives.length}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', fontWeight: 600 }}>Executives</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)}
          style={{ padding: '.45rem .7rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.8rem' }}>
          <option value="">All leads</option>
          <option value="unassigned">Unassigned only</option>
          {executives.map(ex => <option key={ex.id} value={ex.id}>{ex.full_name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '.45rem .7rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.8rem' }}>
          <option value="">Any status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginLeft: 'auto', background: '#F0FBF0', border: '1px solid #cfe8bd', borderRadius: 10, padding: '.4rem .7rem' }}>
            <span style={{ fontSize: '.8rem', color: '#234023', fontWeight: 600 }}>{selected.size} selected</span>
            <select value={bulkAssignTo} onChange={e => setBulkAssignTo(e.target.value)}
              style={{ padding: '.35rem .6rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.78rem' }}>
              <option value="">Assign to…</option>
              {executives.map(ex => <option key={ex.id} value={ex.id}>{ex.full_name}</option>)}
            </select>
            <button
              disabled={!bulkAssignTo || bulkAssignMutation.isPending}
              onClick={() => bulkAssignMutation.mutate({ ids: [...selected], assigned_to: bulkAssignTo })}
              className="btn-primary btn-sm" style={{ width: 'auto', fontSize: '.78rem' }}>
              {bulkAssignMutation.isPending ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
      ) : leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📇</p>
          <p style={{ color: 'var(--gray-400)' }}>No leads match this filter.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '.75rem 1rem' }}>
                  <input type="checkbox" checked={selected.size > 0 && selected.size === leads.length} onChange={toggleSelectAll} />
                </th>
                {['Lead', 'Course Interested', 'Status', 'Assigned To', 'Last Contacted', 'Added'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '.75rem 1rem', fontSize: '.72rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--gray-200)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.85rem' }}>{lead.name}</p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '.72rem' }}>
                      {lead.phone}{lead.email ? ` · ${lead.email}` : ''}
                    </p>
                  </td>
                  <td style={{ padding: '.85rem 1rem', color: 'var(--gray-600)', fontSize: '.82rem' }}>
                    {lead.course_interested || <span style={{ color: 'var(--gray-300)' }}>—</span>}
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <span style={{ background: STATUS_COLOR[lead.status]?.bg || 'var(--gray-100)', color: STATUS_COLOR[lead.status]?.color || 'var(--gray-500)', fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      {lead.status}
                    </span>
                    {lead.admin_note && (
                      <p style={{ color: 'var(--gray-400)', fontSize: '.68rem', marginTop: 3, maxWidth: 200 }}>"{lead.admin_note}"</p>
                    )}
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <select
                      value={lead.assigned_to || ''}
                      onChange={e => assignMutation.mutate({ id: lead.id, assigned_to: e.target.value || null })}
                      style={{ padding: '.35rem .6rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.78rem', minWidth: 140 }}>
                      <option value="">— Unassigned —</option>
                      {executives.map(ex => <option key={ex.id} value={ex.id}>{ex.full_name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '.85rem 1rem', color: 'var(--gray-500)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                    {lead.last_contacted_at ? dayjs(lead.last_contacted_at).format('DD MMM, h:mm A') : <span style={{ color: 'var(--gray-300)' }}>Never</span>}
                  </td>
                  <td style={{ padding: '.85rem 1rem', color: 'var(--gray-500)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                    {dayjs(lead.created_at).format('DD MMM YYYY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-box fade-in">
            <div className="modal-header">
              <h2>Add Lead</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); addLeadMutation.mutate(newLead); }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Name</label>
                  <input className="igo-input" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone</label>
                  <input className="igo-input" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
                  <input className="igo-input" type="email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Course Interested <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
                  <input className="igo-input" value={newLead.course_interested} onChange={e => setNewLead({ ...newLead, course_interested: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Location <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
                  <input className="igo-input" value={newLead.location} onChange={e => setNewLead({ ...newLead, location: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Notes <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span></label>
                  <textarea className="igo-input" rows={2} value={newLead.message} onChange={e => setNewLead({ ...newLead, message: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm" style={{ width: 'auto' }} disabled={addLeadMutation.isPending}>
                  {addLeadMutation.isPending ? 'Adding…' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

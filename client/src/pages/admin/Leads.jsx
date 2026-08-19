/**
 * Admin — website enquiry/lead management. Per requirements doc §8.
 * Status flow: New → Contacted → Interested → Follow-up → Enrolled → Not Interested → Closed
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const STATUSES = ['New', 'Contacted', 'Interested', 'Follow-up', 'Enrolled', 'Not Interested', 'Closed'];
const STATUS_COLOR = {
  New: { bg: '#dbeafe', color: '#1d4ed8' },
  Contacted: { bg: '#e0e7ff', color: '#4338ca' },
  Interested: { bg: '#fef3c7', color: '#b45309' },
  'Follow-up': { bg: '#fed7aa', color: '#c2410c' },
  Enrolled: { bg: '#dcfce7', color: '#16a34a' },
  'Not Interested': { bg: '#fee2e2', color: '#dc2626' },
  Closed: { bg: 'var(--gray-100)', color: 'var(--gray-400)' },
};

export default function AdminLeads() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['enquiries', filter],
    queryFn: () => api.get(`/enquiries${filter ? `?status=${filter}` : ''}`).then(r => r.data.data || []),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/enquiries/${id}`, body),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries(['enquiries']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>Leads</h1>
        <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', margin: '.25rem 0 0' }}>Enquiries submitted through the website contact form and course pages</p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilter('')}
          className={filter === '' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
          style={{ width: 'auto' }}
        >All</button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            style={{ width: 'auto' }}
          >{s}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
      ) : leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-400)' }}>No enquiries {filter ? `with status "${filter}"` : 'yet'}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {leads.map(lead => (
            <div key={lead.id} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)', padding: '1.1rem 1.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.3rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{lead.name}</span>
                    <span className="badge" style={{ background: STATUS_COLOR[lead.status]?.bg, color: STATUS_COLOR[lead.status]?.color, fontSize: '.68rem' }}>{lead.status}</span>
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
                  <select
                    value={lead.status}
                    onChange={e => updateMutation.mutate({ id: lead.id, status: e.target.value })}
                    style={{ padding: '.4rem .7rem', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '.8rem' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
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
  );
}

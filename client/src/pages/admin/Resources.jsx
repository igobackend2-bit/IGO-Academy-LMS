import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const COLOR = { navy: '#0C2014', green: '#16402B', mid: '#235C39', gray200: '#dde5dd', gray400: '#9ca3af' };
const EMPTY = { type: 'information', title: '', content: '', display_order: 0, is_active: true, course_id: '', batch_id: '' };

export default function AdminResources() {
  const qc = useQueryClient();
  const [tab, setTab]             = useState('information');
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [pdfFile, setPdfFile]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const fileRef = useRef();

  // ── Data queries ──────────────────────────────────────────
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['resources', tab],
    queryFn: () => api.get(`/resources?type=${tab}`).then(r => r.data.data || []),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => api.get('/courses').then(r => r.data.data || []),
    enabled: !!modal,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches', form.course_id],
    queryFn: () => api.get(`/batches?course_id=${form.course_id}`).then(r => r.data.data || []),
    enabled: !!form.course_id && !!modal,
  });

  // ── Mutations ─────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (d) => modal?.mode === 'edit'
      ? api.put(`/resources/${modal.data.id}`, d)
      : api.post('/resources', d),
    onSuccess: async (res) => {
      const savedId = modal?.mode === 'edit' ? modal.data.id : res.data.data?.id;
      if (pdfFile && savedId) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('pdf', pdfFile);
          await api.post(`/resources/${savedId}/pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          toast.success(modal?.mode === 'edit' ? 'Saved + PDF uploaded' : 'Created + PDF uploaded');
        } catch {
          toast.error('Resource saved but PDF upload failed');
        } finally { setUploading(false); }
      } else {
        toast.success(modal?.mode === 'edit' ? 'Updated' : 'Created');
      }
      qc.invalidateQueries(['resources', tab]);
      setModal(null); setPdfFile(null);
    },
    onError: e => toast.error(e.response?.data?.message || 'Error saving'),
  });

  const removePdfMutation = useMutation({
    mutationFn: (id) => api.delete(`/resources/${id}/pdf`),
    onSuccess: () => { toast.success('PDF removed'); qc.invalidateQueries(['resources', tab]); },
    onError: () => toast.error('Failed to remove PDF'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/resources/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['resources', tab]); setDeleteId(null); },
    onError: e => toast.error(e.response?.data?.message || 'Error'),
  });

  // ── Helpers ───────────────────────────────────────────────
  const openCreate = () => {
    setForm({ ...EMPTY, type: tab });
    setPdfFile(null);
    setModal({ mode: 'create' });
  };
  const openEdit = (row) => {
    setForm({
      type: row.type, title: row.title, content: row.content || '',
      display_order: row.display_order, is_active: row.is_active,
      course_id: row.course_id || '', batch_id: row.batch_id || '',
    });
    setPdfFile(null);
    setModal({ mode: 'edit', data: row });
  };
  const closeModal = () => { setModal(null); setPdfFile(null); };
  const isBusy = saveMutation.isPending || uploading;

  const scopeLabel = (row) => {
    if (row.batch_name)  return `📦 ${row.course_title} · ${row.batch_name}`;
    if (row.course_title) return `📚 ${row.course_title}`;
    return '🌐 All students';
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer',
      fontWeight: 700, fontSize: '.85rem',
      background: tab === id ? COLOR.navy : 'transparent',
      color: tab === id ? 'white' : COLOR.gray400,
    }}>{label}</button>
  );

  const selectStyle = {
    width: '100%', border: `1.5px solid ${COLOR.gray200}`, borderRadius: 9,
    padding: '.55rem .75rem', fontSize: '.875rem', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: 'white',
  };

  return (
    <div className="p-8 page-enter">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-2xl font-black text-igo-navy">Resources</h1>
          <p style={{ color: COLOR.gray400, fontSize: '.82rem', marginTop: 2 }}>
            Manage student-facing information and notes — scoped to courses and batches
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ width: 'auto', padding: '.6rem 1.4rem' }}>
          + Add {tab === 'information' ? 'Information' : 'Note'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 12, padding: 4, marginBottom: '1.5rem', width: 'fit-content' }}>
        <TabBtn id="information" label="📋 Information" />
        <TabBtn id="note"        label="📝 Notes" />
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '3.5rem', textAlign: 'center', border: `1px solid ${COLOR.gray200}` }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>{tab === 'information' ? '📋' : '📝'}</p>
          <p style={{ color: COLOR.navy, fontWeight: 700, fontSize: '1rem', marginBottom: '.35rem' }}>No {tab === 'information' ? 'information' : 'notes'} yet</p>
          <p style={{ color: COLOR.gray400, fontSize: '.82rem', marginBottom: '1.25rem' }}>Click "+ Add" to create the first entry.</p>
          <button onClick={openCreate} className="btn-primary" style={{ width: 'auto', padding: '.55rem 1.4rem', margin: '0 auto' }}>
            + Add {tab === 'information' ? 'Information' : 'Note'}
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${COLOR.gray200}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['#', 'Title', 'Audience', 'PDF', 'Status', 'Updated', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '.75rem 1rem', fontSize: '.72rem', fontWeight: 700, color: COLOR.navy, textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: `1px solid ${COLOR.gray200}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${COLOR.gray200}`, opacity: row.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '.85rem 1rem', color: COLOR.gray400, fontSize: '.78rem', fontWeight: 700 }}>{row.display_order}</td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <p style={{ fontWeight: 700, color: COLOR.navy }}>{row.title}</p>
                    <p style={{ color: COLOR.gray400, fontSize: '.72rem', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {row.content?.replace(/<[^>]+>/g, '') || '—'}
                    </p>
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <span style={{
                      background: row.batch_id ? '#fef3c7' : row.course_id ? '#dbeafe' : '#f0fdf4',
                      color:      row.batch_id ? '#92400e' : row.course_id ? '#1d4ed8' : '#15803d',
                      fontSize: '.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap',
                    }}>{scopeLabel(row)}</span>
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    {row.pdf_path ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>📄 PDF</span>
                        <button onClick={() => setPreviewId(row.id)} style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '.7rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 600 }}>View</button>
                      </div>
                    ) : <span style={{ color: COLOR.gray400, fontSize: '.75rem' }}>—</span>}
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <span style={{ background: row.is_active ? '#dcfce7' : '#f1f5f9', color: row.is_active ? '#15803d' : '#64748b', fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      {row.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '.85rem 1rem', color: COLOR.gray400, fontSize: '.75rem', whiteSpace: 'nowrap' }}>
                    {dayjs(row.updated_at || row.created_at).format('DD MMM YYYY')}
                  </td>
                  <td style={{ padding: '.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button onClick={() => openEdit(row)} style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => setDeleteId(row.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '.35rem .75rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 660, width: '100%', maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <h2 style={{ color: COLOR.navy, fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {modal.mode === 'edit' ? 'Edit' : 'New'} {form.type === 'information' ? 'Information' : 'Note'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Syllabus Overview"
                  style={{ ...selectStyle, border: `1.5px solid ${COLOR.gray200}` }} />
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Content (text)</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={6} placeholder="Write content here. Students see this as read-only text."
                  style={{ ...selectStyle, border: `1.5px solid ${COLOR.gray200}`, resize: 'vertical', lineHeight: 1.65 }} />
              </div>

              {/* ── Audience scope ── */}
              <div style={{ background: '#f8faff', borderRadius: 12, padding: '1rem', border: '1.5px solid #c7d7f5' }}>
                <p style={{ fontSize: '.78rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '.75rem' }}>🎯 Who sees this?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>

                  {/* Course dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Course</label>
                    <select value={form.course_id}
                      onChange={e => setForm(f => ({ ...f, course_id: e.target.value, batch_id: '' }))}
                      style={selectStyle}>
                      <option value="">🌐 All students (no filter)</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  {/* Batch dropdown — only when a course is selected */}
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Batch</label>
                    <select value={form.batch_id}
                      onChange={e => setForm(f => ({ ...f, batch_id: e.target.value }))}
                      disabled={!form.course_id}
                      style={{ ...selectStyle, opacity: form.course_id ? 1 : 0.45 }}>
                      <option value="">All batches of this course</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    {!form.course_id && (
                      <p style={{ color: COLOR.gray400, fontSize: '.68rem', marginTop: 3 }}>Select a course first</p>
                    )}
                    {form.course_id && batches.length === 0 && (
                      <p style={{ color: COLOR.gray400, fontSize: '.68rem', marginTop: 3 }}>No batches yet — enroll students with a batch to create them</p>
                    )}
                  </div>
                </div>
                <p style={{ color: COLOR.gray400, fontSize: '.7rem', marginTop: '.6rem' }}>
                  {!form.course_id && '🌐 Visible to all enrolled students'}
                  {form.course_id && !form.batch_id && '📚 Visible to all students enrolled in this course'}
                  {form.course_id && form.batch_id && '📦 Visible only to the selected batch'}
                </p>
              </div>

              {/* PDF Upload */}
              <div style={{ background: '#f8faff', borderRadius: 12, padding: '1rem', border: '1.5px dashed #c7d7f5' }}>
                <p style={{ fontSize: '.78rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '.5rem' }}>📄 PDF Attachment (optional)</p>
                {modal.mode === 'edit' && modal.data.pdf_path && !pdfFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dbeafe', borderRadius: 8, padding: '.45rem .75rem', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.78rem', color: '#1d4ed8', fontWeight: 600 }}>✅ PDF already uploaded</span>
                    <button onClick={() => removePdfMutation.mutate(modal.data.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '.25rem .6rem', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                )}
                {pdfFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dcfce7', borderRadius: 8, padding: '.45rem .75rem', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.78rem', color: '#15803d', fontWeight: 600 }}>📎 {pdfFile.name} ({(pdfFile.size/1024/1024).toFixed(1)} MB)</span>
                    <button onClick={() => { setPdfFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '.85rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf,application/pdf"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { if (f.size > 20*1024*1024) { toast.error('PDF must be under 20 MB'); return; } setPdfFile(f); } }}
                  style={{ display: 'none' }} />
                <button onClick={() => fileRef.current?.click()}
                  style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '.45rem 1rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  {pdfFile || (modal.mode === 'edit' && modal.data.pdf_path) ? '🔄 Replace PDF' : '+ Upload PDF'}
                </button>
                <p style={{ color: COLOR.gray400, fontSize: '.72rem', marginTop: '.4rem' }}>Students can view inline — download is blocked.</p>
              </div>

              {/* Order + Visibility */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Display Order</label>
                  <input type="number" value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                    style={{ ...selectStyle, border: `1.5px solid ${COLOR.gray200}` }} />
                </div>
                {modal.mode === 'edit' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Visibility</label>
                    <select value={form.is_active ? 'true' : 'false'}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
                      style={selectStyle}>
                      <option value="true">Active (visible to students)</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => saveMutation.mutate(form)} disabled={!form.title || isBusy}
                style={{ flex: 1, background: `linear-gradient(135deg,${COLOR.green},${COLOR.mid})`, color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer', opacity: (!form.title || isBusy) ? 0.6 : 1 }}>
                {uploading ? 'Uploading PDF…' : saveMutation.isPending ? 'Saving…' : modal.mode === 'edit' ? 'Save Changes' : 'Create'}
              </button>
              <button onClick={closeModal} disabled={isBusy}
                style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PDF Preview (admin) ── */}
      {previewId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) setPreviewId(null); }}>
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 900, maxHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <div style={{ background: COLOR.navy, padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '.9rem' }}>📄 PDF Preview</span>
              <button onClick={() => setPreviewId(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', borderRadius: 8, padding: '.35rem .7rem', cursor: 'pointer', fontWeight: 700 }}>✕ Close</button>
            </div>
            <iframe src={`/api/resources/${previewId}/pdf`} style={{ flex: 1, border: 'none', minHeight: 500 }} title="PDF Preview" />
          </div>
        </div>,
        document.body
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🗑️</p>
            <h3 style={{ color: COLOR.navy, fontWeight: 800, marginBottom: '.4rem' }}>Delete this entry?</h3>
            <p style={{ color: COLOR.gray400, fontSize: '.85rem', marginBottom: '1.5rem' }}>This cannot be undone. Any attached PDF will also be removed.</p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 700, cursor: 'pointer' }}>
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 10, padding: '.65rem', fontWeight: 600, cursor: 'pointer' }}>
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

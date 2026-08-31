/**
 * Admin — Categories. Manages public.categories (Supabase), the table the
 * Flutter app actually reads for category filtering — the LMS course form
 * just types a category name; course.controller.js's syncCourseToPublic()
 * links that name to a row here (creating one if it doesn't exist yet).
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', icon_url: '', color_hex: '#4FA02E' };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', category? }
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data || []),
  });

  const openCreate = () => { setForm(EMPTY_FORM); setModal({ mode: 'create' }); };
  const openEdit = (cat) => {
    setForm({ name: cat.name || '', description: cat.description || '', icon_url: cat.icon_url || '', color_hex: cat.color_hex || '#4FA02E' });
    setModal({ mode: 'edit', category: cat });
  };

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/categories', data),
    onSuccess: () => { toast.success('Category created'); qc.invalidateQueries(['categories']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/categories/${id}`, data),
    onSuccess: () => { toast.success('Category updated'); qc.invalidateQueries(['categories']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { toast.success('Category deleted'); qc.invalidateQueries(['categories']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete category'),
  });

  const save = () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    if (modal.mode === 'create') createMutation.mutate(form);
    else updateMutation.mutate({ id: modal.category.id, ...form });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>Categories</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', margin: '.25rem 0 0' }}>
            Feeds the app's category filters directly — any course whose category name matches one here links to it automatically.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm" style={{ width: 'auto' }}>+ New Category</button>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-400)' }}>No categories yet — they're also created automatically the first time a course uses a new category name.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--gray-200)', padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.5rem' }}>
                {cat.icon_url ? (
                  <img src={cat.icon_url} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: cat.color_hex || 'var(--gray-100)', flexShrink: 0 }} />
                )}
                <span style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '.92rem' }}>{cat.name}</span>
              </div>
              {cat.description && (
                <p style={{ color: 'var(--gray-500)', fontSize: '.78rem', marginBottom: '.6rem', lineHeight: 1.4 }}>{cat.description}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.5rem' }}>
                <span style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', fontSize: '.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>
                  {cat.course_count ?? 0} course{cat.course_count === 1 ? '' : 's'}
                </span>
                <div style={{ display: 'flex', gap: '.4rem' }}>
                  <button onClick={() => openEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                  <button
                    onClick={() => { if (confirm(`Delete "${cat.name}"? This only works while no courses use it.`)) deleteMutation.mutate(cat.id); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.48)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: 'white', borderRadius: 18, padding: '1.75rem', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
            <h2 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '1.1rem' }}>
              {modal.mode === 'create' ? 'New Category' : `Edit "${modal.category.name}"`}
            </h2>

            <div style={{ marginBottom: '.8rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Name *</label>
              <input className="igo-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Horticulture" autoFocus />
            </div>
            <div style={{ marginBottom: '.8rem' }}>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Description</label>
              <textarea className="igo-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Icon URL</label>
                <input className="igo-input" value={form.icon_url} onChange={e => setForm(f => ({ ...f, icon_url: e.target.value }))} placeholder="Optional" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '.3rem' }}>Color</label>
                <input type="color" value={form.color_hex} onChange={e => setForm(f => ({ ...f, color_hex: e.target.value }))} style={{ width: '100%', height: 38, border: '1.5px solid var(--gray-200)', borderRadius: 9, cursor: 'pointer' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary btn-sm" style={{ flex: 1, width: 'auto' }}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setModal(null)} className="btn-outline btn-sm" style={{ flex: 1, width: 'auto' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

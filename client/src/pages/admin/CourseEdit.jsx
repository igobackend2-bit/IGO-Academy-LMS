import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Horticulture', 'Aquaculture', 'Agri-Business', 'Agri-Tech',
  'Organic Farming', 'Livestock & Dairy', 'Farmpreneur Skills',
  'Irrigation & Water', 'Post-Harvest', 'Soil Science',
];
const LEVELS     = ['beginner', 'intermediate', 'advanced'];

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Math.round(v.duration) || 0); };
    v.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    v.src = url;
  });
}

function CourseInfoPanel({ course, courseId, qc }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [customCat, setCustomCat] = useState(false);

  const startEdit = () => {
    setForm({
      title:             course.title             || '',
      short_description: course.short_description || '',
      description:       course.description       || '',
      category:          course.category          || '',
      level:             course.level             || '',
      prerequisites:     course.prerequisites     || '',
      duration_hours:    course.duration_hours    ?? '',
      price:             course.price             ?? '',
    });
    setEditing(true);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: (data) => api.put(`/courses/${courseId}`, data),
    onSuccess: () => {
      toast.success('Course info saved');
      setEditing(false);
      qc.invalidateQueries(['course', courseId]);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  if (editing && form) {
    return (
      <div className="igo-card mb-6">
        <h3 className="font-bold text-igo-navy mb-4">Edit Course Info</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          <div>
            <label className="form-label">Title *</label>
            <input className="igo-input" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input className="igo-input" value={form.short_description} onChange={e => set('short_description', e.target.value)} placeholder="One-line card summary" maxLength={500} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="igo-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div>
              <label className="form-label">Category</label>
              {customCat ? (
                <div style={{ display: 'flex', gap: '.4rem' }}>
                  <input className="igo-input" placeholder="Type category name…" value={form.category}
                    onChange={e => set('category', e.target.value)} style={{ flex: 1 }} autoFocus />
                  <button type="button" onClick={() => { set('category', ''); setCustomCat(false); }}
                    style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '0 .6rem', cursor: 'pointer', color: 'var(--gray-400)', fontWeight: 700 }}>✕</button>
                </div>
              ) : (
                <select className="igo-select" value={CATEGORIES.includes(form.category) ? form.category : (form.category ? '__custom__' : '')}
                  onChange={e => {
                    if (e.target.value === '__custom__') { setCustomCat(true); }
                    else { set('category', e.target.value); setCustomCat(false); }
                  }}>
                  <option value="">None</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ Add custom category…</option>
                </select>
              )}
            </div>
            <div>
              <label className="form-label">Level</label>
              <select className="igo-select" value={form.level} onChange={e => set('level', e.target.value)}>
                <option value="">None</option>
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div>
              <label className="form-label">Duration (hours)</label>
              <input className="igo-input" type="number" min="1" value={form.duration_hours} onChange={e => set('duration_hours', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Price (₹)</label>
              <input className="igo-input" type="number" min="0" placeholder="0 = free" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Prerequisites</label>
            <input className="igo-input" value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)} placeholder="e.g. Basic Botany" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
          <button className="btn-primary btn-sm" style={{ width: 'auto' }}
            onClick={() => saveMutation.mutate({ ...form, duration_hours: Number(form.duration_hours), price: form.price !== '' ? Number(form.price) : undefined })}
            disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save'}
          </button>
          <button className="btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  // Read-only summary
  return (
    <div className="igo-card mb-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
        <div>
          <h2 className="text-2xl font-black text-igo-navy">{course.title}</h2>
          {course.short_description && <p className="text-gray-500 text-sm mt-1">{course.short_description}</p>}
        </div>
        <button onClick={startEdit} className="btn-outline btn-sm" style={{ width: 'auto', whiteSpace: 'nowrap' }}>Edit Info</button>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
        {course.category && <span className="badge-green">{course.category}</span>}
        {course.level    && <span className="badge-gold" style={{ textTransform: 'capitalize' }}>{course.level}</span>}
        {course.price > 0 && <span className="badge-green">₹{Number(course.price).toLocaleString('en-IN')}</span>}
        <span className="badge-gold">{course.duration_hours}h</span>
        <span className="text-gray-400 text-xs self-center">{course.trainer_name || 'No trainer'}</span>
      </div>

      {course.prerequisites && (
        <p className="text-xs text-gray-400"><span className="font-semibold text-gray-600">Prerequisites:</span> {course.prerequisites}</p>
      )}
    </div>
  );
}

export default function AdminCourseEdit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [modForm, setModForm] = useState({ title: '', description: '', order_index: 1, completion_pct: 80, duration_secs: 0 });
  const [uploading, setUploading] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInputOpen, setUrlInputOpen] = useState({});
  const [urlInputVal, setUrlInputVal] = useState({});
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const pickVideo = (moduleId) => {
    uploadTargetRef.current = moduleId;
    fileInputRef.current?.click();
  };

  const saveVideoUrl = async (moduleId) => {
    const url = (urlInputVal[moduleId] || '').trim();
    if (!url) return;
    try {
      await api.post(`/courses/${courseId}/modules`, { id: moduleId, video_s3_key: url });
      toast.success('Video URL saved');
      setUrlInputOpen(p => ({ ...p, [moduleId]: false }));
      setUrlInputVal(p => ({ ...p, [moduleId]: '' }));
      qc.invalidateQueries(['course', courseId]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save URL'); }
  };

  const handleVideoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const moduleId = uploadTargetRef.current;
    if (!file || !moduleId) return;
    if (!/\.(mp4|mov|m4v|webm)$/i.test(file.name)) { toast.error('Only MP4 / MOV / WEBM files are supported'); return; }

    setUploading(moduleId);
    setUploadProgress(0);
    try {
      const duration_secs = await getVideoDuration(file);
      const fd = new FormData();
      fd.append('video', file);
      fd.append('duration_secs', String(duration_secs));
      await api.post(`/courses/modules/${moduleId}/upload-video`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total) setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      });
      toast.success('Video uploaded successfully');
      qc.invalidateQueries(['course', courseId]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data.data),
  });

  const addModMutation = useMutation({
    mutationFn: (d) => api.post(`/courses/${courseId}/modules`, d),
    onSuccess: () => { toast.success('Module added'); qc.invalidateQueries(['course', courseId]); setShowModuleForm(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
  const deleteModMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/modules/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['course', courseId]); },
  });
  const publishModMutation = useMutation({
    mutationFn: ({ id, is_published }) => api.post(`/courses/${courseId}/modules`, { id, is_published }),
    onSuccess: () => qc.invalidateQueries(['course', courseId]),
  });

  if (isLoading) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 page-enter">
      <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov" style={{ display: 'none' }} onChange={handleVideoFile} />

      <button onClick={() => navigate('/admin/courses')} className="text-igo-green text-sm font-semibold mb-4 block">← Back to Courses</button>

      {/* Course info read/edit panel */}
      <CourseInfoPanel course={course} courseId={courseId} qc={qc} />

      {/* Module management */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="font-bold text-igo-navy text-lg">Modules</h3>
        <button onClick={() => setShowModuleForm(true)} className="btn-primary btn-sm" style={{ width: 'auto' }}>+ Add Module</button>
      </div>

      {showModuleForm && (
        <div className="igo-card mb-6">
          <h3 className="font-bold text-igo-navy mb-4">New Module</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><input className="igo-input" placeholder="Module Title" value={modForm.title} onChange={e => setModForm({ ...modForm, title: e.target.value })} /></div>
            <div className="col-span-2"><textarea rows={2} className="igo-input" placeholder="Description" value={modForm.description} onChange={e => setModForm({ ...modForm, description: e.target.value })} /></div>
            <div><input type="number" className="igo-input" placeholder="Order" value={modForm.order_index} onChange={e => setModForm({ ...modForm, order_index: parseInt(e.target.value) })} /></div>
            <div><input type="number" className="igo-input" placeholder="Completion %" value={modForm.completion_pct} onChange={e => setModForm({ ...modForm, completion_pct: parseInt(e.target.value) })} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => addModMutation.mutate(modForm)} className="btn-primary">Save Module</button>
            <button onClick={() => setShowModuleForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {course?.modules?.length === 0 && <p className="text-gray-400 text-sm">No modules yet. Add your first module above.</p>}
        {course?.modules?.map((mod, i) => (
          <div key={mod.id} className="igo-card" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-igo-navy-light flex items-center justify-center font-bold text-igo-navy">{i + 1}</div>
                <div>
                  <p className="font-semibold text-igo-navy">{mod.title}</p>
                  <p className="text-xs text-gray-400">
                    {mod.duration_secs ? `${Math.round(mod.duration_secs / 60)} mins` : 'No video'} · {mod.completion_pct}% to complete
                    {mod.video_s3_key?.startsWith('http') && <span style={{ color: '#2d6a14', marginLeft: 6 }}>🔗 URL video</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={mod.is_published ? 'badge-green' : 'badge-gold'}>{mod.is_published ? 'Published' : 'Draft'}</span>
                <button onClick={() => pickVideo(mod.id)} disabled={uploading === mod.id} className="text-xs text-igo-navy font-semibold hover:underline disabled:opacity-50" style={{ minWidth: 90 }}>
                  {uploading === mod.id
                    ? uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Preparing…'
                    : mod.video_s3_key ? '⬆ Replace' : '⬆ Upload'}
                </button>
                <button onClick={() => setUrlInputOpen(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: urlInputOpen[mod.id] ? '#dc2626' : '#2563eb' }}>
                  {urlInputOpen[mod.id] ? 'Cancel' : '🔗 URL'}
                </button>
                <button onClick={() => publishModMutation.mutate({ id: mod.id, is_published: !mod.is_published })} className="text-xs text-igo-green font-semibold hover:underline">
                  {mod.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteModMutation.mutate(mod.id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
            {urlInputOpen[mod.id] && (
              <div style={{ display: 'flex', gap: '.5rem', paddingLeft: '3.5rem' }}>
                <input className="igo-input" style={{ flex: 1, fontSize: '.8rem' }}
                  placeholder="Paste video URL (MP4, YouTube embed, etc.)…"
                  value={urlInputVal[mod.id] || ''}
                  onChange={e => setUrlInputVal(p => ({ ...p, [mod.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && saveVideoUrl(mod.id)} />
                <button onClick={() => saveVideoUrl(mod.id)} className="btn-primary btn-sm" style={{ width: 'auto', whiteSpace: 'nowrap' }}>Save URL</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

/** Read a video file's duration (seconds) locally before upload */
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

export default function AdminCourseEdit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [modForm, setModForm] = useState({ title:'', description:'', order_index:1, completion_pct:80, duration_secs:0 });
  const [uploading, setUploading] = useState(null); // moduleId being uploaded
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const pickVideo = (moduleId) => {
    uploadTargetRef.current = moduleId;
    fileInputRef.current?.click();
  };

  const handleVideoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    const moduleId = uploadTargetRef.current;
    if (!file || !moduleId) return;
    if (!/\.(mp4|mov|m4v|webm)$/i.test(file.name)) { toast.error('Only MP4 / MOV video files are supported'); return; }

    setUploading(moduleId);
    try {
      const duration_secs = await getVideoDuration(file);
      const { data: urlRes } = await api.get(`/courses/modules/${moduleId}/upload-url`, {
        params: { filename: file.name, contentType: file.type || 'video/mp4' },
      });
      const { uploadUrl, key } = urlRes.data;

      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'video/mp4' },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      await api.post(`/courses/${courseId}/modules`, { id: moduleId, video_s3_key: key, duration_secs });
      toast.success('Video uploaded');
      qc.invalidateQueries(['course', courseId]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };
  const { data: course, isLoading } = useQuery({ queryKey:['course',courseId], queryFn:()=>api.get(`/courses/${courseId}`).then(r=>r.data.data) });
  const addModMutation = useMutation({
    mutationFn: (d) => api.post(`/courses/${courseId}/modules`, d),
    onSuccess: () => { toast.success('Module added'); qc.invalidateQueries(['course',courseId]); setShowModuleForm(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
  const deleteModMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/modules/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['course',courseId]); },
  });
  const publishModMutation = useMutation({
    mutationFn: ({ id, is_published }) => api.post(`/courses/${courseId}/modules`, { id, is_published }),
    onSuccess: () => qc.invalidateQueries(['course',courseId]),
  });
  if (isLoading) return <div className="p-8 text-gray-400">Loading…</div>;
  return (
    <div className="p-8">
      <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov" style={{display:'none'}} onChange={handleVideoFile} />
      <button onClick={()=>navigate('/admin/courses')} className="text-igo-green text-sm font-semibold mb-4 block">← Back to Courses</button>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-igo-navy">{course?.title}</h1>
        <p className="text-gray-500 text-sm">{course?.trainer_name || 'No trainer'} · {course?.duration_hours}h</p></div>
        <button onClick={()=>setShowModuleForm(true)} className="btn-primary">+ Add Module</button>
      </div>
      {showModuleForm && (
        <div className="igo-card mb-6">
          <h3 className="font-bold text-igo-navy mb-4">New Module</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><input className="igo-input" placeholder="Module Title" value={modForm.title} onChange={e=>setModForm({...modForm,title:e.target.value})} /></div>
            <div className="col-span-2"><textarea rows={2} className="igo-input" placeholder="Description" value={modForm.description} onChange={e=>setModForm({...modForm,description:e.target.value})} /></div>
            <div><input type="number" className="igo-input" placeholder="Order" value={modForm.order_index} onChange={e=>setModForm({...modForm,order_index:parseInt(e.target.value)})} /></div>
            <div><input type="number" className="igo-input" placeholder="Completion %" value={modForm.completion_pct} onChange={e=>setModForm({...modForm,completion_pct:parseInt(e.target.value)})} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={()=>addModMutation.mutate(modForm)} className="btn-primary">Save Module</button>
            <button onClick={()=>setShowModuleForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {course?.modules?.length === 0 && <p className="text-gray-400 text-sm">No modules yet.</p>}
        {course?.modules?.map((mod,i)=>(
          <div key={mod.id} className="igo-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-igo-navy-light flex items-center justify-center font-bold text-igo-navy">{i+1}</div>
              <div>
                <p className="font-semibold text-igo-navy">{mod.title}</p>
                <p className="text-xs text-gray-400">{mod.duration_secs ? `${Math.round(mod.duration_secs/60)} mins` : 'No video'} · {mod.completion_pct}% to complete</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={mod.is_published ? 'badge-green' : 'badge-gold'}>{mod.is_published ? 'Published' : 'Draft'}</span>
              <button onClick={()=>pickVideo(mod.id)} disabled={uploading === mod.id} className="text-xs text-igo-navy font-semibold hover:underline disabled:opacity-50">
                {uploading === mod.id ? 'Uploading…' : mod.video_s3_key ? 'Replace Video' : '⬆ Upload Video'}
              </button>
              <button onClick={()=>publishModMutation.mutate({id:mod.id, is_published:!mod.is_published})} className="text-xs text-igo-green font-semibold hover:underline">
                {mod.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={()=>deleteModMutation.mutate(mod.id)} className="text-xs text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

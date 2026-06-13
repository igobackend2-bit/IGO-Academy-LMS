import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
export default function AdminAssessments() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState('');
  const { data: courses } = useQuery({ queryKey:['courses'], queryFn:()=>api.get('/courses').then(r=>r.data.data) });
  const { data: assessments } = useQuery({ queryKey:['assessments', courseId], queryFn:()=>courseId ? api.get('/assessments', {params:{course_id:courseId}}).then(r=>r.data.data) : [], enabled:!!courseId });
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-igo-navy mb-6">Assessments</h1>
      <div className="mb-4"><select className="igo-input w-64" value={courseId} onChange={e=>setCourseId(e.target.value)}>
        <option value="">Select Course</option>
        {courses?.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
      </select></div>
      <div className="space-y-3">
        {assessments?.map(a=>(
          <div key={a.id} className="igo-card flex items-center justify-between">
            <div><p className="font-bold text-igo-navy">{a.title}</p>
            <p className="text-sm text-gray-500 capitalize">{a.type} · Max {a.max_score}pts</p></div>
            <span className={a.is_published ? 'badge-green' : 'badge-gold'}>{a.is_published ? 'Published' : 'Draft'}</span>
          </div>
        ))}
        {courseId && (!assessments || assessments.length === 0) && <p className="text-gray-400 text-sm">No assessments for this course.</p>}
      </div>
    </div>
  );
}

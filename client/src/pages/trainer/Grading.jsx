import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
export default function TrainerGrading() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [grading, setGrading] = useState({});
  const { data: courses } = useQuery({ queryKey:['courses'], queryFn:()=>api.get('/courses').then(r=>r.data.data) });
  const { data: assessments } = useQuery({ queryKey:['assessments',courseId], queryFn:()=>courseId?api.get('/assessments',{params:{course_id:courseId}}).then(r=>r.data.data):[], enabled:!!courseId });
  const { data: submissions } = useQuery({ queryKey:['subs',assessmentId], queryFn:()=>assessmentId?api.get(`/assessments/${assessmentId}/submissions`).then(r=>r.data.data):[], enabled:!!assessmentId });
  const gradeMutation = useMutation({
    mutationFn: ({id,...d})=>api.put(`/assessments/submissions/${id}/grade`,{...d,course_id:courseId}),
    onSuccess:()=>{ toast.success('Graded!'); qc.invalidateQueries(['subs',assessmentId]); },
    onError:(e)=>toast.error(e.response?.data?.message||'Error'),
  });
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-igo-navy mb-6">Grading</h1>
      <div className="flex gap-4 mb-6">
        <select className="igo-input w-64" value={courseId} onChange={e=>{setCourseId(e.target.value);setAssessmentId('');}}>
          <option value="">Select Course</option>
          {courses?.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {courseId && <select className="igo-input w-64" value={assessmentId} onChange={e=>setAssessmentId(e.target.value)}>
          <option value="">Select Assessment</option>
          {assessments?.filter(a=>a.type!=='quiz').map(a=><option key={a.id} value={a.id}>{a.title}</option>)}
        </select>}
      </div>
      <div className="space-y-4">
        {submissions?.map(s=>{
          const g = grading[s.id] || { score: s.score||'', feedback: s.feedback||'' };
          return (
            <div key={s.id} className="igo-card">
              <div className="flex items-start justify-between mb-3">
                <div><p className="font-bold text-igo-navy">{s.full_name}</p>
                <p className="text-xs text-gray-400">{s.email} · {dayjs(s.submitted_at).format('DD MMM YYYY HH:mm')}</p></div>
                <span className={`badge-${s.status==='graded'?'green':s.status==='submitted'?'gold':'navy'}`}>{s.status}</span>
              </div>
              {s.answers && <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-600 max-h-32 overflow-y-auto"><pre className="whitespace-pre-wrap">{typeof s.answers==='string'?s.answers:JSON.stringify(s.answers,null,2)}</pre></div>}
              <div className="flex gap-3 items-end">
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Score /{assessments?.find(a=>a.id===assessmentId)?.max_score||100}</label>
                <input type="number" className="igo-input w-24" value={g.score} onChange={e=>setGrading({...grading,[s.id]:{...g,score:e.target.value}})}/></div>
                <div className="flex-1"><label className="text-xs font-semibold text-gray-600 mb-1 block">Feedback</label>
                <input className="igo-input" placeholder="Optional feedback…" value={g.feedback} onChange={e=>setGrading({...grading,[s.id]:{...g,feedback:e.target.value}})}/></div>
                <button onClick={()=>gradeMutation.mutate({id:s.id,score:parseInt(g.score),feedback:g.feedback})} className="btn-primary py-2.5">Save Grade</button>
              </div>
            </div>
          );
        })}
        {assessmentId && (!submissions||submissions.length===0) && <p className="text-gray-400 text-sm">No submissions yet.</p>}
      </div>
    </div>
  );
}

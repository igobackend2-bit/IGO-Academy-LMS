import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
export default function AdminReports() {
  const [courseId, setCourseId] = useState('');
  const { data: courses } = useQuery({ queryKey:['courses'], queryFn:()=>api.get('/courses').then(r=>r.data.data) });
  const { data: attendance } = useQuery({ queryKey:['att-report',courseId], queryFn:()=>api.get('/admin/reports/attendance',{params:{course_id:courseId}}).then(r=>r.data.data), enabled:!!courseId });
  const { data: progress } = useQuery({ queryKey:['prog-report',courseId], queryFn:()=>api.get('/admin/reports/progress',{params:{course_id:courseId}}).then(r=>r.data.data), enabled:!!courseId });
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-igo-navy mb-6">Reports</h1>
      <div className="mb-6"><select className="igo-input w-64" value={courseId} onChange={e=>setCourseId(e.target.value)}>
        <option value="">Select Course</option>
        {courses?.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
      </select></div>
      {courseId && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-igo-navy mb-3">Progress Report</h2>
            <div className="bg-white rounded-xl shadow-igo-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-igo-navy-light"><tr>
                  {['Student','Email','Start','End','Completed Modules','Status'].map(h=><th key={h} className="text-left px-4 py-2 text-xs font-semibold text-igo-navy uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {progress?.map((p,i)=><tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{p.full_name}</td>
                    <td className="px-4 py-2 text-gray-500">{p.email}</td>
                    <td className="px-4 py-2 text-gray-500">{p.start_date}</td>
                    <td className="px-4 py-2 text-gray-500">{p.end_date}</td>
                    <td className="px-4 py-2 font-semibold">{p.completed_modules}</td>
                    <td className="px-4 py-2"><span className={p.is_expired ? 'badge-error':'badge-green'}>{p.is_expired?'Expired':'Active'}</span></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

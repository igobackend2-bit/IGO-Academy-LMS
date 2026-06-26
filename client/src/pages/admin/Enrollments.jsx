import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
export default function AdminEnrollments() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ student_id:'', course_id:'', start_date:'', end_date:'', paid_amount:0 });
  const { data } = useQuery({ queryKey:['enrollments'], queryFn: () => api.get('/enrollments').then(r=>r.data.data) });
  const { data: students } = useQuery({ queryKey:['students'], queryFn: () => api.get('/users?role=student&limit=200').then(r=>r.data.data?.data) });
  const { data: courses } = useQuery({ queryKey:['courses'], queryFn: () => api.get('/courses').then(r=>r.data.data) });
  const createMutation = useMutation({
    mutationFn: (d) => api.post('/enrollments', d),
    onSuccess: () => { toast.success('Student enrolled'); qc.invalidateQueries(['enrollments']); setShowCreate(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/enrollments/${id}`),
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries(['enrollments']); },
  });
  return (
    <div className="p-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-igo-navy">Enrollments</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Enroll Student</button>
      </div>
      {showCreate && (
        <div className="igo-card mb-6">
          <h3 className="font-bold text-igo-navy mb-4">New Enrollment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-semibold text-gray-600 mb-1 block">Student</label>
            <select className="igo-input" value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}>
              <option value="">Select Student</option>
              {students?.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.email}</option>)}
            </select></div>
            <div><label className="text-sm font-semibold text-gray-600 mb-1 block">Course</label>
            <select className="igo-input" value={form.course_id} onChange={e=>setForm({...form,course_id:e.target.value})}>
              <option value="">Select Course</option>
              {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select></div>
            <div><label className="text-sm font-semibold text-gray-600 mb-1 block">Start Date</label>
            <input type="date" className="igo-input" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} /></div>
            <div><label className="text-sm font-semibold text-gray-600 mb-1 block">End Date</label>
            <input type="date" className="igo-input" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} /></div>
            <div><label className="text-sm font-semibold text-gray-600 mb-1 block">Amount Paid (₹)</label>
            <input type="number" className="igo-input" value={form.paid_amount} onChange={e=>setForm({...form,paid_amount:parseFloat(e.target.value)})} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} className="btn-primary">Enroll</button>
            <button onClick={() => setShowCreate(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-igo-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-igo-navy-light"><tr>
            {['Student','Course','Start','End','Amount','Status',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-igo-navy uppercase tracking-wide">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data?.map(e=>(
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{e.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{e.course_title}</td>
                <td className="px-4 py-3 text-gray-500">{dayjs(e.start_date).format('DD MMM YYYY')}</td>
                <td className="px-4 py-3 text-gray-500">{dayjs(e.end_date).format('DD MMM YYYY')}</td>
                <td className="px-4 py-3 font-semibold">₹{e.paid_amount}</td>
                <td className="px-4 py-3"><span className={e.is_expired ? 'badge-error' : 'badge-green'}>{e.is_expired ? 'Expired' : 'Active'}</span></td>
                <td className="px-4 py-3"><button onClick={()=>removeMutation.mutate(e.id)} className="text-xs text-red-500 hover:underline">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

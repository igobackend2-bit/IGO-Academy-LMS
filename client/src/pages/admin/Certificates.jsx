import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
export default function AdminCertificates() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey:['certs'], queryFn:()=>api.get('/certificates').then(r=>r.data.data) });
  const revokeMutation = useMutation({
    mutationFn: ({id,reason})=>api.put(`/certificates/${id}/revoke`,{reason}),
    onSuccess: ()=>{ toast.success('Revoked'); qc.invalidateQueries(['certs']); },
  });
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-igo-navy mb-6">Certificates</h1>
      <div className="bg-white rounded-xl shadow-igo-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-igo-navy-light"><tr>
            {['Certificate ID','Student','Course','Issued','Status',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-igo-navy uppercase tracking-wide">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading…</td></tr> :
            data?.map(c=>(
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-igo-green font-semibold">{c.certificate_id}</td>
                <td className="px-4 py-3">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{c.course_title}</td>
                <td className="px-4 py-3 text-gray-500">{dayjs(c.issued_at).format('DD MMM YYYY')}</td>
                <td className="px-4 py-3"><span className={c.is_valid ? 'badge-green' : 'badge-error'}>{c.is_valid ? 'Valid' : 'Revoked'}</span></td>
                <td className="px-4 py-3">{c.is_valid && <button onClick={()=>revokeMutation.mutate({id:c.id,reason:'Admin revoked'})} className="text-xs text-red-500 hover:underline">Revoke</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

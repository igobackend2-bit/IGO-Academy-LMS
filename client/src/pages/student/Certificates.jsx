import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
export default function StudentCertificates() {
  const { data, isLoading } = useQuery({ queryKey:['my-certs'], queryFn:()=>api.get('/certificates/my').then(r=>r.data.data) });
  const download = async (certId) => {
    try {
      const res = await api.get(`/certificates/${certId}/download`);
      window.open(res.data.data.url, '_blank');
    } catch { toast.error('Download failed'); }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-igo-navy mb-6">My Certificates</h1>
      {isLoading ? <p className="text-gray-400">Loading…</p> :
      data?.length === 0 ? (
        <div className="igo-card text-center py-12">
          <p className="text-5xl mb-4">🎓</p>
          <p className="font-bold text-igo-navy mb-2">No certificates yet</p>
          <p className="text-gray-500 text-sm">Complete your courses to earn certificates!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map(c=>(
            <div key={c.id} className="igo-card border-2 border-igo-gold/30">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">🎓</div>
                <span className={c.is_valid ? 'badge-green' : 'badge-error'}>{c.is_valid ? 'Valid' : 'Revoked'}</span>
              </div>
              <h3 className="font-bold text-igo-navy mb-1">{c.course_title}</h3>
              <p className="text-sm text-gray-500 mb-1">Certificate ID: <span className="font-mono text-igo-green">{c.certificate_id}</span></p>
              <p className="text-xs text-gray-400 mb-4">Issued: {dayjs(c.issued_at).format('DD MMMM YYYY')}</p>
              <div className="flex gap-3">
                {c.is_valid && <button onClick={()=>download(c.id)} className="btn-primary text-sm py-2">⬇ Download PDF</button>}
                <a href={`/verify/${c.certificate_id}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2">🔗 Verify</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import dayjs from 'dayjs';
export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const { data, isLoading } = useQuery({ queryKey:['verify-cert',certificateId], queryFn:()=>api.get(`/certificates/verify/${certificateId}`).then(r=>r.data.data) });
  return (
    <div className="min-h-screen bg-igo-green-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-igo-navy mx-auto flex items-center justify-center mb-3">
            <span className="text-igo-gold font-black text-2xl">I</span>
          </div>
          <h1 className="text-xl font-black text-igo-navy">Certificate Verification</h1>
          <p className="text-gray-500 text-sm">IGo Academy — Grow. Learn. Lead.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-igo-card-hover p-8">
          {isLoading ? <p className="text-center text-gray-400">Verifying…</p> :
          !data ? (
            <div className="text-center">
              <p className="text-5xl mb-4">❌</p>
              <p className="font-bold text-red-600 text-lg">Certificate Not Found</p>
              <p className="text-gray-500 text-sm mt-2">This certificate ID does not exist in our records.</p>
            </div>
          ) : (
            <div>
              <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl ${data.is_valid ? 'bg-igo-green-light' : 'bg-red-50'}`}>
                <span className="text-3xl">{data.is_valid ? '✅' : '❌'}</span>
                <div>
                  <p className={`font-black text-lg ${data.is_valid ? 'text-igo-green' : 'text-red-600'}`}>{data.is_valid ? 'VALID' : 'REVOKED'}</p>
                  {!data.is_valid && data.revoked_reason && <p className="text-xs text-red-500">{data.revoked_reason}</p>}
                </div>
              </div>
              <div className="space-y-3">
                {[['Certificate ID', data.certificate_id, 'font-mono text-igo-green'],['Student Name',data.student_name,'font-semibold'],['Course',data.course_name,''],['Issued',dayjs(data.issued_at).format('DD MMMM YYYY'),'']].map(([label,value,cls])=>(
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-sm ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">© IGo Academy 2026 | TNSDC + MSME Recognised</p>
      </div>
    </div>
  );
}

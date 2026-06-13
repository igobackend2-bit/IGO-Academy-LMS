import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
export default function TrainerCourseView() {
  const { courseId } = useParams();
  const { data: course } = useQuery({ queryKey:['course',courseId], queryFn:()=>api.get(`/courses/${courseId}`).then(r=>r.data.data) });
  return (
    <div className="p-8">
      <Link to="/trainer/dashboard" className="text-igo-green text-sm font-semibold mb-6 block">← Dashboard</Link>
      <h1 className="text-2xl font-black text-igo-navy mb-2">{course?.title}</h1>
      <div className="space-y-3 mt-6">
        {course?.modules?.map((mod,i)=>(
          <div key={mod.id} className="igo-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-igo-navy-light flex items-center justify-center font-bold text-igo-navy">{i+1}</div>
            <div><p className="font-semibold text-igo-navy">{mod.title}</p>
            <p className="text-xs text-gray-400">{mod.is_published ? 'Published' : 'Draft'}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

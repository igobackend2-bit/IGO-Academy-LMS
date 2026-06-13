import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import dayjs from 'dayjs';
export default function StudentAssessments() {
  const { courseId } = useParams();
  const { data: assessments, isLoading } = useQuery({ queryKey:['assessments',courseId], queryFn:()=>api.get('/assessments',{params:{course_id:courseId}}).then(r=>r.data.data) });
  return (
    <div className="p-8">
      <Link to={`/student/course/${courseId}`} className="text-igo-green text-sm font-semibold mb-6 block">← Course</Link>
      <h1 className="text-2xl font-black text-igo-navy mb-6">Assessments</h1>
      {isLoading ? <p className="text-gray-400">Loading…</p> :
      assessments?.map(a=>(
        <div key={a.id} className="igo-card mb-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-igo-navy">{a.title}</p>
            <p className="text-sm text-gray-500 capitalize">{a.type} · {a.max_score} pts{a.timer_mins ? ` · ${a.timer_mins} min` : ''}</p>
            {a.deadline && <p className="text-xs text-orange-500">Due: {dayjs(a.deadline).format('DD MMM YYYY HH:mm')}</p>}
          </div>
          {a.type === 'quiz' && <Link to={`/student/quiz/${a.id}`} className="btn-primary text-sm py-2">Start Quiz →</Link>}
        </div>
      ))}
    </div>
  );
}

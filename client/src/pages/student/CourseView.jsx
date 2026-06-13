import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
export default function StudentCourseView() {
  const { courseId } = useParams();
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data.data),
  });
  const { data: attendance } = useQuery({
    queryKey: ['attendance', courseId],
    queryFn: () => api.get(`/attendance/my/${courseId}`).then(r => r.data.data),
  });
  const getAtt = (moduleId) => attendance?.find(a => a.class_id === moduleId);
  if (isLoading) return <div className="p-8 text-gray-400">Loading…</div>;
  return (
    <div className="p-8">
      <Link to="/student/dashboard" className="text-igo-green text-sm font-semibold mb-6 block">← My Courses</Link>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-igo-navy">{course?.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{course?.description}</p>
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>👤 {course?.trainer_name || 'IGo Academy'}</span>
          <span>⏱ {course?.duration_hours}h</span>
          <span>📦 {course?.modules?.length || 0} modules</span>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="font-bold text-igo-navy text-lg mb-4">Course Modules</h2>
        {course?.modules?.length === 0 && <p className="text-gray-400">No modules published yet.</p>}
        {course?.modules?.map((mod, i) => {
          const att = getAtt(mod.id);
          const pct = att?.watch_pct || 0;
          return (
            <Link key={mod.id} to={`/student/course/${courseId}/module/${mod.id}`}
              className="igo-card flex items-center gap-4 cursor-pointer hover:border-igo-green border-2 border-transparent group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                ${att?.completed ? 'bg-igo-green text-white' : 'bg-igo-navy-light text-igo-navy'}`}>
                {att?.completed ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-igo-navy group-hover:text-igo-green transition-colors">{mod.title}</p>
                <p className="text-xs text-gray-400">{mod.duration_secs ? `${Math.round(mod.duration_secs / 60)} mins` : 'Video lecture'}</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
                  <div className="h-full bg-igo-green rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold text-igo-green">{pct}%</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

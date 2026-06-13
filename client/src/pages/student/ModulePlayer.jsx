import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import VideoPlayer from '@/components/features/VideoPlayer';
import toast from 'react-hot-toast';
export default function StudentModulePlayer() {
  const { courseId, moduleId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['stream', moduleId],
    queryFn: () => api.get(`/modules/${moduleId}/stream`).then(r => r.data.data),
  });
  const { data: course } = useQuery({ queryKey:['course',courseId], queryFn:()=>api.get(`/courses/${courseId}`).then(r=>r.data.data) });
  if (isLoading) return <div className="p-8 text-gray-400">Loading video…</div>;
  return (
    <div className="p-8 max-w-4xl">
      <Link to={`/student/course/${courseId}`} className="text-igo-green text-sm font-semibold mb-6 block">← Back to Course</Link>
      <h1 className="text-xl font-black text-igo-navy mb-6">
        {course?.modules?.find(m=>m.id===moduleId)?.title || 'Lesson'}
      </h1>
      {data?.url ? (
        <VideoPlayer
          streamUrl={data.url}
          moduleId={moduleId}
          initialPosition={data.lastPosition || 0}
          onComplete={() => toast.success('🎉 Module completed!')}
        />
      ) : (
        <div className="bg-gray-100 rounded-xl p-12 text-center text-gray-400">
          <p className="text-4xl mb-4">🎬</p>
          <p>Video not available yet. Check back soon.</p>
        </div>
      )}
      <div className="mt-6 p-4 bg-igo-green-light rounded-xl text-sm text-igo-green-800">
        <strong>📌 Note:</strong> Watch at least {course?.modules?.find(m=>m.id===moduleId)?.completion_pct || 80}% of this video to mark it complete.
        Switching tabs will pause the video and stop counting watch time.
      </div>
    </div>
  );
}

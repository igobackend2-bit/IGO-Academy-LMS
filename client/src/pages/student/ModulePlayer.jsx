/**
 * StudentModulePlayer — video lesson player page
 */
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
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data.data),
  });

  const mod = course?.modules?.find(m => String(m.id) === String(moduleId));
  const completionPct = mod?.completion_pct || 80;

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8f5' }}>

      {/* ── Top bar ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0C2014 0%,#16402B 100%)',
        padding: '1rem 1.75rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <Link to={`/student/course/${courseId}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(141,198,63,0.9)', fontSize: '.78rem', fontWeight: 700,
          textDecoration: 'none', flexShrink: 0,
        }}>← Back to Course</Link>

        {mod?.title && (
          <h1 style={{
            color: 'white', fontWeight: 800, fontSize: 'clamp(.85rem,2vw,1.1rem)',
            letterSpacing: '-.01em', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {mod.title}
          </h1>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>

        {isLoading ? (
          <div style={{
            background: '#0C2014', borderRadius: 16,
            aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(12,32,20,0.25)',
          }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🎬</div>
              <p style={{ fontSize: '.85rem', fontWeight: 600 }}>Loading lesson…</p>
            </div>
          </div>
        ) : data?.url ? (
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(12,32,20,0.2)' }}>
            <VideoPlayer
              streamUrl={data.url}
              moduleId={moduleId}
              initialPosition={data.lastPosition || 0}
              onComplete={() => toast.success('🎉 Module completed! Well done.')}
            />
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center',
            border: '1px solid #e8f0e8', boxShadow: '0 4px 16px rgba(12,32,20,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
            <h2 style={{ color: '#0C2014', fontWeight: 700, fontSize: '1.05rem', marginBottom: '.5rem' }}>
              Video Not Available Yet
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '.88rem' }}>
              This lesson video hasn't been uploaded yet. Please check back soon.
            </p>
          </div>
        )}

        {/* ── Completion note ── */}
        <div style={{
          marginTop: '1.25rem', background: 'rgba(141,198,63,0.07)',
          borderRadius: 12, padding: '1rem 1.25rem',
          border: '1.5px solid rgba(141,198,63,0.25)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: '1rem', marginTop: 1 }}>📌</span>
          <div>
            <p style={{ color: '#16402B', fontWeight: 700, fontSize: '.82rem', marginBottom: '.2rem' }}>
              Completion Requirement
            </p>
            <p style={{ color: '#4b7a5c', fontSize: '.78rem', lineHeight: 1.6 }}>
              Watch at least <strong>{completionPct}%</strong> of this video to mark it as complete.
              Switching browser tabs will pause the video and stop counting your watch time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * IGo Academy Custom Video Player
 * Features: progress tracking, tab-switch pause, no download, custom controls
 * Syncs watch progress to server every 10 seconds
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { DEFAULTS } from '@/constants/brand';

const SYNC_INTERVAL = DEFAULTS.VIDEO_PROGRESS_SYNC_MS; // 10s

export default function VideoPlayer({ streamUrl, moduleId, initialPosition = 0, onComplete }) {
  const videoRef = useRef(null);
  const syncTimer = useRef(null);
  const watchedSecsRef = useRef(0);    // actual watched seconds (no skipping)
  const lastSyncPos = useRef(0);
  const lastPlayPos = useRef(initialPosition);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [buffering, setBuffering] = useState(true);

  // ── Sync progress to server ───────────────────────────────
  const syncProgress = useCallback(async () => {
    if (!moduleId || !duration) return;
    try {
      const res = await api.post('/attendance/progress', {
        module_id: moduleId,
        watched_seconds: Math.round(watchedSecsRef.current),
        last_position_secs: Math.round(videoRef.current?.currentTime || 0),
        video_duration_secs: Math.round(duration),
      });
      if (res.data.data?.completed && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    } catch { /* silent */ }
  }, [moduleId, duration, completed, onComplete]);

  // ── Start/stop sync timer ─────────────────────────────────
  useEffect(() => {
    if (playing) {
      syncTimer.current = setInterval(syncProgress, SYNC_INTERVAL);
    } else {
      clearInterval(syncTimer.current);
    }
    return () => clearInterval(syncTimer.current);
  }, [playing, syncProgress]);

  // ── Tab visibility detection ──────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setPlaying(false);
        setTabWarning(true);
        syncProgress();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [syncProgress]);

  // ── Track actual watch time (no seek forward counting) ────
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const ct = v.currentTime;
    setCurrentTime(ct);

    // Only count forward playback (not seeks)
    if (ct > lastPlayPos.current && ct - lastPlayPos.current < 2) {
      watchedSecsRef.current += (ct - lastPlayPos.current);
    }
    lastPlayPos.current = ct;
  };

  // ── Block seeking ahead beyond watched + 10% ──────────────
  const handleSeeking = () => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const maxSeek = Math.min(watchedSecsRef.current + duration * 0.1, duration);
    if (v.currentTime > maxSeek) {
      v.currentTime = maxSeek;
    }
  };

  // ── Set initial position ──────────────────────────────────
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    if (initialPosition > 0) {
      v.currentTime = initialPosition;
      lastPlayPos.current = initialPosition;
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); setTabWarning(false); }
    else          { v.pause(); setPlaying(false); syncProgress(); }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
  };

  const handleSpeedChange = (s) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative bg-black rounded-xl overflow-hidden select-none" style={{ userSelect: 'none' }}>
      {/* Prevent right-click download */}
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setPlaying(false); syncProgress(); }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
      />

      {/* Buffering spinner — video is loading/re-buffering data */}
      {buffering && !tabWarning && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-white/25 border-t-white animate-spin" />
        </div>
      )}

      {/* Tab-switch warning overlay */}
      {tabWarning && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-4">
          <div className="text-4xl">⚠️</div>
          <p className="font-bold text-lg">Video paused — you left the window</p>
          <p className="text-sm text-gray-300">Click play to continue. Only active watch time counts.</p>
          <button onClick={togglePlay} className="btn-secondary mt-2">▶ Resume</button>
        </div>
      )}

      {/* Completed banner */}
      {completed && (
        <div className="absolute top-4 right-4 bg-igo-green text-white text-xs font-bold px-3 py-1.5 rounded-full">
          ✓ Completed
        </div>
      )}

      {/* Custom Controls */}
      <div className="bg-igo-navy px-4 py-3">
        {/* Progress bar */}
        <div className="mb-3 relative h-1.5 bg-gray-600 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct  = (e.clientX - rect.left) / rect.width;
            const target = pct * duration;
            const maxSeek = Math.min(watchedSecsRef.current + duration * 0.1, duration);
            if (videoRef.current && target <= maxSeek) {
              videoRef.current.currentTime = target;
            }
          }}>
          <div className="absolute h-full bg-igo-gold rounded-full" style={{ width: `${progressPct}%` }} />
          <div className="absolute h-full bg-igo-green/30 rounded-full" style={{ width: `${Math.min((watchedSecsRef.current / duration) * 100, 100)}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white text-xl w-8 h-8 flex items-center justify-center">
              {playing ? '⏸' : '▶'}
            </button>
            <span className="text-gray-300 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">🔊</span>
              <input type="range" min={0} max={1} step={0.05} value={volume}
                onChange={handleVolumeChange} className="w-16 accent-igo-gold" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0.75, 1, 1.25, 1.5].map(s => (
              <button key={s} onClick={() => handleSpeedChange(s)}
                className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${speed === s ? 'bg-igo-gold text-igo-navy' : 'text-gray-300 hover:text-white'}`}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

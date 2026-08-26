import { useEffect, useRef, useState } from 'react';

const FADE_DURATION = 0.5; // seconds

export function useLoopingVideoFade() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const [opacity, setOpacity] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      const { currentTime, duration } = video;

      if (duration && Number.isFinite(duration)) {
        if (currentTime < FADE_DURATION) {
          setOpacity(Math.min(currentTime / FADE_DURATION, 1));
        } else if (currentTime > duration - FADE_DURATION) {
          const remaining = duration - currentTime;
          setOpacity(Math.max(remaining / FADE_DURATION, 0));
        } else {
          setOpacity(1);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      setOpacity(0);
      window.setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => setHasError(true));
      }, 100);
    };

    const handleError = () => setHasError(true);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    rafRef.current = requestAnimationFrame(tick);

    video.play().catch(() => setHasError(true));

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { videoRef, opacity, hasError };
}

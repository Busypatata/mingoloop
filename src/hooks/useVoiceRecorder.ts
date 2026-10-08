import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_RECORDING_SECONDS = 120;

// Chrome/Edge record webm, Firefox ogg, Safari mp4 — take the first one the
// browser supports.
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

export interface RecordedAudio {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
}

interface UseVoiceRecorderOptions {
  // Called when the recording hits MAX_RECORDING_SECONDS and stops on its own.
  onAutoStop?: (audio: RecordedAudio) => void;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useVoiceRecorder({ onAutoStop }: UseVoiceRecorderOptions = {}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const cancelledRef = useRef(false);
  const resolveRef = useRef<((audio: RecordedAudio | null) => void) | null>(null);
  const onAutoStopRef = useRef(onAutoStop);

  useEffect(() => {
    onAutoStopRef.current = onAutoStop;
  }, [onAutoStop]);

  const releaseMic = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice messages are not supported in this browser.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      cancelledRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        const resolve = resolveRef.current;
        resolveRef.current = null;
        releaseMic();

        if (cancelledRef.current || blob.size === 0) {
          resolve?.(null);
          return;
        }
        const audio = { blob, mimeType: type, durationSeconds };
        if (resolve) resolve(audio);
        else onAutoStopRef.current?.(audio);
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      recorder.start();

      setSeconds(0);
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS && recorderRef.current?.state === 'recording') {
          recorderRef.current.stop();
        }
      }, 250);

      return true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        setError('Microphone access is blocked. Allow it in your browser settings to send voice messages.');
      } else if (err?.name === 'NotFoundError') {
        setError('No microphone was found on this device.');
      } else {
        setError('Could not start recording. Please try again.');
      }
      return false;
    }
  }, [releaseMic]);

  // Stops recording and resolves with the audio (null if nothing was captured).
  const stop = useCallback(
    () =>
      new Promise<RecordedAudio | null>((resolve) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          resolve(null);
          return;
        }
        resolveRef.current = resolve;
        recorder.stop();
      }),
    []
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    else releaseMic();
  }, [releaseMic]);

  // Never leave the microphone on after leaving the page.
  useEffect(() => cancel, [cancel]);

  return { recording, seconds, error, start, stop, cancel };
}

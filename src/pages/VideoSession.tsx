import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function VideoSession() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [phraseDraft, setPhraseDraft] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ durationSeconds: number; savedPhraseCount: number } | null>(null);

  useEffect(() => {
    if (!socket || !userId) return;
    const activeSocket = socket;
    const partnerId = userId;

    let isMounted = true;

    async function setup() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        setStatus('connected');
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          activeSocket.emit('ice_candidate', { toUserId: partnerId, candidate: event.candidate });
        }
      };

      // The user with the "smaller" id initiates the offer, so both sides
      // don't simultaneously try to be the caller.
      const iAmCaller = (user?.id || '') < partnerId;

      if (iAmCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        activeSocket.emit('call_offer', { toUserId: partnerId, offer, fromName: user?.name });
      }

      const res = await api.post('/sessions', { userId: partnerId });
      if (isMounted) setSessionId(res.data.id);
    }

    setup();

    function handleOffer({ offer }: { offer: RTCSessionDescriptionInit }) {
      const pc = pcRef.current;
      if (!pc) return;
      pc.setRemoteDescription(new RTCSessionDescription(offer)).then(async () => {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        activeSocket.emit('call_answer', { toUserId: partnerId, answer });
      });
    }

    function handleAnswer({ answer }: { answer: RTCSessionDescriptionInit }) {
      pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    }

    function handleIceCandidate({ candidate }: { candidate: RTCIceCandidateInit }) {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    }

    function handleCallEnd() {
      setStatus('ended');
    }

    activeSocket.on('call_offer', handleOffer);
    activeSocket.on('call_answer', handleAnswer);
    activeSocket.on('ice_candidate', handleIceCandidate);
    activeSocket.on('call_end', handleCallEnd);

    return () => {
      isMounted = false;
      activeSocket.off('call_offer', handleOffer);
      activeSocket.off('call_answer', handleAnswer);
      activeSocket.off('ice_candidate', handleIceCandidate);
      activeSocket.off('call_end', handleCallEnd);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, userId]);

  function toggleMic() {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  }

  function toggleCamera() {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((v) => !v);
  }

  async function endCall() {
    if (socket && userId) socket.emit('call_end', { toUserId: userId });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();

    if (sessionId) {
      const res = await api.patch(`/sessions/${sessionId}/end`, {
        savedPhrases: phrases.map((text) => ({ text })),
      });
      setSummary(res.data);
    }
    setStatus('ended');
  }

  function addPhrase() {
    if (!phraseDraft.trim()) return;
    setPhrases((prev) => [...prev, phraseDraft.trim()]);
    setPhraseDraft('');
  }

  if (status === 'ended') {
    const minutes = summary ? Math.round(summary.durationSeconds / 60) : Math.round((Date.now() - startedAt) / 60000);
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#000000' }}>
          Session complete.
        </h1>
        <p className="mb-1" style={{ color: '#6F6F6F' }}>
          Duration: {minutes} minute{minutes === 1 ? '' : 's'}
        </p>
        <p className="mb-10" style={{ color: '#6F6F6F' }}>
          Words saved: {summary?.savedPhraseCount ?? phrases.length}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 rounded-full text-sm"
          style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#000000' }}>
      <header className="px-6 py-4 text-center text-sm" style={{ color: '#FFFFFF' }}>
        {status === 'connecting' ? 'Connecting…' : 'Live session'}
      </header>

      <div className="flex-1 relative flex items-center justify-center">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-6 right-6 w-40 h-28 rounded-xl object-cover border-2"
          style={{ borderColor: 'rgba(255,255,255,0.3)' }}
        />
      </div>

      <div
        className="px-6 py-3 flex flex-col gap-2"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <input
            value={phraseDraft}
            onChange={(e) => setPhraseDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPhrase()}
            placeholder="Save a new word or phrase…"
            className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          />
          <button onClick={addPhrase} className="text-sm px-4 py-2 rounded-full" style={{ color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
            Save
          </button>
        </div>
        {phrases.length > 0 && (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {phrases.length} phrase{phrases.length === 1 ? '' : 's'} saved
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 py-6" style={{ backgroundColor: '#000000' }}>
        <button
          onClick={toggleMic}
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: micOn ? 'rgba(255,255,255,0.15)' : '#B3261E', color: '#FFFFFF' }}
        >
          {micOn ? 'Mic' : 'Muted'}
        </button>
        <button
          onClick={toggleCamera}
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: cameraOn ? 'rgba(255,255,255,0.15)' : '#B3261E', color: '#FFFFFF' }}
        >
          {cameraOn ? 'Cam' : 'Off'}
        </button>
        <button
          onClick={endCall}
          className="px-8 py-3 rounded-full text-sm"
          style={{ backgroundColor: '#B3261E', color: '#FFFFFF' }}
        >
          End call
        </button>
      </div>
    </div>
  );
}

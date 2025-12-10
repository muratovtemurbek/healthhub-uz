// src/pages/VideoCall.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Phone,
  MessageCircle, MoreVertical, Maximize2, Minimize2,
  Volume2, VolumeX, RotateCcw, User, Loader2
} from 'lucide-react';
import api from '../services/api';

interface CallInfo {
  call_id: string;
  room_id: string;
  caller: { id: string; name: string };
  receiver: { id: string; name: string };
  status: string;
  is_video: boolean;
  started_at: string | null;
  duration: number;
}

export default function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isIncoming = searchParams.get('incoming') === 'true';
  const callIdParam = searchParams.get('callId');

  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);

  // Media controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isIncoming && callIdParam) {
      // Kiruvchi qo'ng'iroq
      fetchCallInfo(callIdParam);
    } else if (roomId) {
      // Chiquvchi qo'ng'iroq
      startCall();
    }

    return () => {
      cleanup();
    };
  }, [roomId, isIncoming, callIdParam]);

  useEffect(() => {
    if (callStatus === 'active') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  const fetchCallInfo = async (callId: string) => {
    try {
      const response = await api.get(`/chat/call/${callId}/status/`);
      setCallInfo(response.data);
      setCallStatus('ringing');
      await initLocalMedia();
    } catch (error) {
      console.error('Error fetching call info:', error);
      navigate(-1);
    }
  };

  const startCall = async () => {
    try {
      await initLocalMedia();

      const response = await api.post(`/chat/call/start/${roomId}/`, {
        is_video: true
      });

      setCallInfo(response.data);
      setCallStatus('ringing');

      // Poll for answer
      pollCallStatus(response.data.call_id);
    } catch (error: any) {
      console.error('Error starting call:', error);
      alert(error.response?.data?.error || 'Qo\'ng\'iroq boshlanmadi');
      navigate(-1);
    }
  };

  const initLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Media access error:', error);
      alert('Kamera yoki mikrofonga ruxsat berilmadi');
    }
  };

  const pollCallStatus = (callId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/chat/call/${callId}/status/`);

        if (response.data.status === 'active') {
          setCallStatus('active');
          clearInterval(interval);
        } else if (['ended', 'declined', 'missed'].includes(response.data.status)) {
          setCallStatus('ended');
          clearInterval(interval);
          setTimeout(() => navigate(-1), 2000);
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 2000);

    // 60 sekund javob kutish
    setTimeout(() => {
      clearInterval(interval);
      if (callStatus === 'ringing') {
        handleEndCall();
      }
    }, 60000);
  };

  const handleAnswerCall = async () => {
    if (!callInfo) return;

    try {
      await api.post(`/chat/call/${callInfo.call_id}/answer/`);
      setCallStatus('active');
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const handleDeclineCall = async () => {
    if (!callInfo) return;

    try {
      await api.post(`/chat/call/${callInfo.call_id}/decline/`);
      cleanup();
      navigate(-1);
    } catch (error) {
      console.error('Error declining call:', error);
      navigate(-1);
    }
  };

  const handleEndCall = async () => {
    if (!callInfo) {
      cleanup();
      navigate(-1);
      return;
    }

    try {
      await api.post(`/chat/call/${callInfo.call_id}/end/`);
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
      cleanup();
      navigate(-1);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOtherUserName = () => {
    if (!callInfo) return 'Shifokor';
    return isIncoming ? callInfo.caller.name : callInfo.receiver.name;
  };

  // Kiruvchi qo'ng'iroq - javob berish ekrani
  if (isIncoming && callStatus === 'ringing') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <User className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{getOtherUserName()}</h2>
          <p className="text-white/70">Kiruvchi video qo'ng'iroq...</p>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={handleDeclineCall}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-8 w-8 text-white" />
          </button>

          <button
            onClick={handleAnswerCall}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors animate-bounce"
          >
            <Phone className="h-10 w-10 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Qo'ng'iroq jarayonida
  return (
    <div className="h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Remote Video (Full Screen) */}
      <div className="flex-1 relative bg-gray-800">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Placeholder when no remote video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-16 w-16 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{getOtherUserName()}</h2>
            <p className="text-gray-400">
              {callStatus === 'connecting' && 'Ulanmoqda...'}
              {callStatus === 'ringing' && 'Jiringlamoqda...'}
              {callStatus === 'active' && formatDuration(duration)}
              {callStatus === 'ended' && 'Qo\'ng\'iroq tugadi'}
            </p>
          </div>
        </div>
      </div>

      {/* Local Video (Small) */}
      <div className="absolute top-4 right-4 w-32 h-44 bg-gray-800 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <VideoOff className="h-8 w-8 text-gray-500" />
          </div>
        )}
      </div>

      {/* Call Info */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
        <p className="text-white font-medium">{getOtherUserName()}</p>
        <p className="text-white/70 text-sm">
          {callStatus === 'active' ? formatDuration(duration) : callStatus === 'ringing' ? 'Kutilmoqda...' : 'Ulanmoqda...'}
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              !isVideoEnabled ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6 text-white" />
            ) : (
              <VideoOff className="h-6 w-6 text-white" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-7 w-7 text-white" />
          </button>

          {/* Speaker */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              !isSpeakerOn ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isSpeakerOn ? (
              <Volume2 className="h-6 w-6 text-white" />
            ) : (
              <VolumeX className="h-6 w-6 text-white" />
            )}
          </button>

          {/* Chat */}
          <button
            onClick={() => navigate(`/chat/${roomId}`)}
            className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {callStatus === 'connecting' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white">Ulanmoqda...</p>
          </div>
        </div>
      )}
    </div>
  );
}

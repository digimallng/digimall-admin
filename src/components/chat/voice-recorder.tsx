'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Square, Play, Pause, Send, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
  className?: string;
}

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  className?: string;
}

function AudioVisualizer({ analyser, isRecording, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const draw = useCallback(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.fillStyle = 'rgb(249, 250, 251)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, 'rgb(59, 130, 246)');
      gradient.addColorStop(1, 'rgb(147, 197, 253)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  }, [analyser, isRecording]);

  useEffect(() => {
    if (isRecording && analyser) {
      draw();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, analyser, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className={cn('rounded border bg-gray-50', className)}
    />
  );
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDuration = 300, // 5 minutes
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        setPermissionStatus(permission.state);

        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      } catch (error) {
        console.error('Error checking microphone permission:', error);
      }
    };

    checkPermission();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);

  const setupAudioContext = useCallback(async (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (error) {
      console.error('Error setting up audio context:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      await setupAudioContext(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
        } else {
          setError('Failed to access microphone. Please try again.');
        }
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  }, [setupAudioContext]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const playRecording = useCallback(() => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  }, [isPlaying]);

  const handleSend = useCallback(() => {
    if (audioUrl) {
      // Convert audio URL to blob
      fetch(audioUrl)
        .then(response => response.blob())
        .then(blob => {
          onRecordingComplete(blob, duration);
          // Clean up
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
          setDuration(0);
        });
    }
  }, [audioUrl, duration, onRecordingComplete]);

  const handleCancel = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setDuration(0);
    setError(null);
    onCancel?.();
  }, [isRecording, audioUrl, stopRecording, onCancel]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Request permission if needed
  const requestPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const permission = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      setPermissionStatus(permission.state);
    } catch (error) {
      setError('Failed to get microphone permission');
    }
  }, []);

  if (permissionStatus === 'denied') {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Microphone Access Denied</p>
            <p className="text-sm">
              Please enable microphone permissions in your browser settings.
            </p>
            <button
              onClick={requestPermission}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
              title="Start recording"
            >
              <Mic className="h-6 w-6" />
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-2">
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
                title={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                onClick={stopRecording}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white transition-colors hover:bg-gray-600"
                title="Stop recording"
              >
                <Square className="h-5 w-5" />
              </button>
            </div>
          )}

          {audioUrl && (
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
              title={isPlaying ? 'Pause playback' : 'Play recording'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          )}

          <div className="font-mono text-sm text-gray-600">
            {formatTime(duration)}
            {maxDuration && <span className="text-gray-400"> / {formatTime(maxDuration)}</span>}
          </div>
        </div>

        {(isRecording || audioUrl) && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Cancel recording"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            {audioUrl && (
              <button
                onClick={handleSend}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                title="Send recording"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            )}
          </div>
        )}
      </div>

      {/* Waveform Visualizer */}
      {isRecording && (
        <div className="flex flex-col items-center space-y-2">
          <AudioVisualizer
            analyser={analyserRef.current}
            isRecording={!isPaused}
            className="w-full max-w-md"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                !isPaused ? 'animate-pulse bg-red-500' : 'bg-gray-400'
              )}
            />
            {isPaused ? 'Recording paused' : 'Recording...'}
          </div>
        </div>
      )}
    </div>
  );
}

// Make AudioContext available on window for TypeScript
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

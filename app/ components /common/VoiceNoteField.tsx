'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Mic, Square, AudioLines, Trash2, FileAudio } from 'lucide-react';
import { toast } from 'sonner';
import VoiceWaveform from './VoiceWaveform';
import VoiceSupportGuide from './VoiceSupportGuide';

const CONSENT_KEY = 'forgesync_voice_note_consent';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// --- Types ---
interface VoiceNoteData {
  blob: Blob;
  durationSeconds: number;
  transcript: string;
  deleteAfterTranscription: boolean;
}

interface UploadResult {
  voice_note_url?: string;
  voice_note_duration_seconds?: number;
  voice_note_deleted_after_transcription: boolean;
}

// --- Upload function (Supabase replacement) ---
export async function uploadPrivateVoiceNote(voiceNote: VoiceNoteData): Promise<UploadResult> {
  if (!voiceNote?.blob) {
    return {
      voice_note_url: undefined,
      voice_note_duration_seconds: undefined,
      voice_note_deleted_after_transcription: false,
    };
  }

  if (voiceNote.deleteAfterTranscription) {
    return {
      voice_note_url: undefined,
      voice_note_duration_seconds: voiceNote.durationSeconds,
      voice_note_deleted_after_transcription: true,
    };
  }

  const extension = voiceNote.blob.type?.includes('ogg')
    ? 'ogg'
    : voiceNote.blob.type?.includes('mp4')
      ? 'mp4'
      : 'webm';

  const fileName = `voice-notes/${Date.now()}.${extension}`;

  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase.storage
    .from('documents') // Update to your bucket name
    .upload(fileName, voiceNote.blob, {
      contentType: voiceNote.blob.type || 'audio/webm',
      upsert: false,
    });

  if (error) {
    console.error('Upload failed:', error);
    throw new Error('Could not upload voice note');
  }

  return {
    voice_note_url: fileName,
    voice_note_duration_seconds: voiceNote.durationSeconds,
    voice_note_deleted_after_transcription: false,
  };
}

// --- Component ---
interface Props {
  onTranscript?: (transcript: string) => void;
  onChange?: (data: VoiceNoteData | null) => void;
  className?: string;
}

export default function VoiceNoteField({ onTranscript, onChange, className = '' }: Props) {
  const supabase = createClientComponentClient<Database>();
  const [isSupported, setIsSupported] = useState(true);
  const [supportsTranscription, setSupportsTranscription] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [deleteAfterTranscription, setDeleteAfterTranscription] = useState(false);
  const [showSupportGuide, setShowSupportGuide] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'listening' | 'ready' | 'error' | 'unsupported'>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canRecord = !!(navigator.mediaDevices && window.MediaRecorder);
    setIsSupported(canRecord);
    setSupportsTranscription(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    setShowConsent(!localStorage.getItem(CONSENT_KEY));
  }, []);

  useEffect(() => {
    if (!onChange) return;

    if (!audioBlob) {
      onChange(null);
      return;
    }

    onChange({
      blob: audioBlob,
      durationSeconds,
      transcript,
      deleteAfterTranscription,
    });
  }, [audioBlob, durationSeconds, transcript, deleteAfterTranscription, onChange]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks()?.forEach((track) => track.stop());
    speechRecognitionRef.current?.stop?.();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const transcriptReady = useMemo(() => transcript.trim().length > 0, [transcript]);

  const handleConsent = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShowConsent(false);
  };

  const resetRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks()?.forEach((track) => track.stop());
    speechRecognitionRef.current?.stop?.();
    setIsRecording(false);
    setDurationSeconds(0);
    setTranscript('');
    setTranscriptionStatus('idle');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');
    setAudioBlob(null);
    setDeleteAfterTranscription(false);
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = (window as any).__forgeGlobalExperience?.language_code || navigator.language || 'en-AU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const combined = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      setTranscript(combined);
      setTranscriptionStatus(combined ? 'ready' : 'listening');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        setTranscriptionStatus('error');
        toast.error('Live transcription is not available in this browser right now.');
      }
    };

    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      toast.error('Live transcription could not start on this browser, but recording is still available.');
    }
  };

  const handleStartRecording = async () => {
    if (!isSupported) {
      toast.error('Audio recording is not supported in this browser.');
      return;
    }

    try {
      resetRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const localUrl = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(localUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setTranscriptionStatus(supportsTranscription ? 'listening' : 'unsupported');
      timerRef.current = window.setInterval(() => {
        setDurationSeconds((current) => current + 1);
      }, 1000);

      if (supportsTranscription) startRecognition();
    } catch {
      toast.error('Microphone access was blocked. Please allow access and try again.');
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    speechRecognitionRef.current?.stop?.();
    setIsRecording(false);
  };

  const handleTranscribe = () => {
    if (!supportsTranscription) {
      toast.error('This browser can record audio, but live transcription is not supported here.');
      return;
    }

    if (!transcriptReady) {
      toast.error('No transcript was captured. Try speaking a little slower and closer to the mic.');
      return;
    }

    onTranscript?.(transcript.trim());
    toast.success('Transcript added. You can edit it before saving.');
  };

  if (!isSupported) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Direct in-app recording is not available in this browser, but you can still use device dictation or a free web fallback below.
        </div>
        <VoiceSupportGuide browserRecordingSupported={false} browserTranscriptionSupported={false} />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showConsent && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Voice recordings are stored securely and only accessible to authorised team members.</p>
          <Button type="button" size="sm" variant="outline" className="mt-3" onClick={handleConsent}>
            I understand
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Voice note</p>
            <p className="text-xs text-slate-500">Hands-free dictation follows your selected global language.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setShowSupportGuide((current) => !current)}>
              {showSupportGuide ? 'Hide voice options' : 'Voice options'}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`h-14 rounded-2xl px-5 text-base ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isRecording ? <Square className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
              {isRecording ? 'Stop recording' : 'Start recording'}
            </Button>
          </div>
        </div>

        {showSupportGuide && (
          <div className="mt-4">
            <VoiceSupportGuide
              browserRecordingSupported={isSupported}
              browserTranscriptionSupported={supportsTranscription}
            />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <AudioLines className={`h-4 w-4 shrink-0 ${isRecording ? 'text-red-600' : 'text-blue-600'}`} />
            <span className="truncate">{isRecording ? 'Recording…' : audioBlob ? 'Ready to review' : 'Waiting to record'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">
              {transcriptionStatus === 'listening' ? 'Transcribing live…' : transcriptionStatus === 'ready' ? 'Transcript ready' : transcriptionStatus === 'error' ? 'Transcript unavailable' : transcriptionStatus === 'unsupported' ? 'Browser lacks live transcript' : 'Transcript idle'}
            </span>
            <span className="font-semibold tabular-nums">{formatDuration(durationSeconds)}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Best results: Chrome or Edge on desktop/Android. On iPhone, iPad, or Mac, you can also use the keyboard microphone for built-in dictation.
        </p>

        {(isRecording || audioBlob) && (
          <div className="mt-4 space-y-3">
            <VoiceWaveform audioBlob={audioBlob} isRecording={isRecording} />

            {audioUrl && (
              <audio controls src={audioUrl} className="w-full" />
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleTranscribe} disabled={!audioBlob || !transcriptReady}>
                <FileAudio className="mr-2 h-4 w-4" />
                Use transcript
              </Button>
              <Button type="button" variant="ghost" onClick={resetRecording} disabled={isRecording}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete recording
              </Button>
            </div>

            {transcriptReady && (
              <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-900">
                Transcript ready. Tap “Transcribe” to insert it into the note.
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="delete-audio-after-transcription"
                checked={deleteAfterTranscription}
                onCheckedChange={(checked) => setDeleteAfterTranscription(!!checked)}
              />
              <label htmlFor="delete-audio-after-transcription" className="text-sm text-slate-600">
                Delete audio after transcription and keep text only
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  audioBlob: Blob | null;
  isRecording?: boolean;
}

export default function VoiceWaveform({ audioBlob, isRecording = false }: Props) {
  const [bars, setBars] = useState<number[]>(
    Array.from({ length: 24 }, (_, i) => ((i % 5) + 3) / 10)
  );

  useEffect(() => {
    if (isRecording || !audioBlob) return;

    let cancelled = false;

    const loadBars = async () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        const audioContext = new AudioContextClass();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
        const channel = audioBuffer.getChannelData(0);
        const samples = 24;
        const blockSize = Math.floor(channel.length / samples) || 1;
        const nextBars: number[] = [];

        for (let i = 0; i < samples; i += 1) {
          const start = i * blockSize;
          const block = channel.slice(start, start + blockSize);
          const sum = block.reduce((total, value) => total + Math.abs(value), 0);
          nextBars.push(Math.max(0.12, Math.min(1, (sum / block.length) * 6 || 0.12)));
        }

        if (!cancelled) setBars(nextBars);
        audioContext.close();
      } catch {
        if (!cancelled) {
          setBars(
            Array.from({ length: 24 }, (_, i) => ((i % 6) + 2) / 10)
          );
        }
      }
    };

    loadBars();
    return () => {
      cancelled = true;
    };
  }, [audioBlob, isRecording]);

  return (
    <div className="flex h-16 items-end gap-1 rounded-2xl bg-slate-50 px-3 py-3 border border-slate-200">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`flex-1 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 ${isRecording ? 'animate-pulse' : ''}`}
          style={{
            height: `${Math.max(16, height * 100)}%`,
            animationDelay: `${index * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

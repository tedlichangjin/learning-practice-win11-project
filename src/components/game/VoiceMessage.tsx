"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic2, Pause, Play } from "lucide-react";

interface VoiceMessageProps {
  audioUrl?: string;
  isGenerating?: boolean;
}

function generateWaveHeights(count: number): number[] {
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    heights.push(8 + ((i * 7 + 3) % 13));
  }
  return heights;
}

export function VoiceMessage({ audioUrl, isGenerating }: VoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const waveHeights = useMemo(() => generateWaveHeights(20), []);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.onloadedmetadata = () => {
        setDuration(Math.ceil(audioRef.current?.duration || 0));
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio?.addEventListener("ended", handleEnded);
    return () => {
      audio?.removeEventListener("ended", handleEnded);
    };
  }, []);

  if (isGenerating && !audioUrl) {
    return (
      <div className="inline-flex min-w-[132px] items-center gap-2 rounded-[8px] bg-[#a83246] px-3 py-2 text-white shadow-sm">
        <Mic2 className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-medium">语音生成中...</span>
      </div>
    );
  }

  if (!audioUrl) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white/90 px-2.5 py-1.5 shadow-sm">
      <audio ref={audioRef} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a83246] text-white transition hover:bg-[#912b3d]"
        aria-label={isPlaying ? "暂停语音" : "播放语音"}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
        )}
      </button>
      <div className="flex items-center gap-[2px]">
        {waveHeights
          .slice(0, Math.max(3, Math.min(duration * 2, 20)))
          .map((h, i) => (
            <div
              key={i}
              className={`w-[2px] rounded-full ${
                isPlaying ? "bg-[#a83246] animate-pulse" : "bg-stone-300"
              }`}
              style={{
                height: `${h}px`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
      </div>
      <span className="text-xs text-stone-500">{duration}&quot;</span>
    </div>
  );
}

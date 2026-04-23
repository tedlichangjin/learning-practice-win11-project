"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface VoiceMessageProps {
  audioUrl?: string;
  isGenerating?: boolean;
}

// 预计算波形高度，避免渲染时调用 Math.random
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
    const handleEnded = () => setIsPlaying(false);
    audioRef.current?.addEventListener("ended", handleEnded);
    return () => {
      audioRef.current?.removeEventListener("ended", handleEnded);
    };
  }, []);

  if (isGenerating && !audioUrl) {
    return (
      <div className="flex items-center gap-2 bg-[#FF9500] rounded-lg px-3 py-2 min-w-[100px]">
        <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
        </svg>
        <span className="text-white text-xs">语音生成中...</span>
      </div>
    );
  }

  if (!audioUrl) return null;

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} preload="metadata" />
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF9500] text-white hover:bg-[#E68600] transition-colors"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex items-center gap-1">
        {/* 语音波形 */}
        <div className="flex items-center gap-[2px]">
          {waveHeights.slice(0, Math.max(3, Math.min(duration * 2, 20))).map((h, i) => (
            <div
              key={i}
              className={`w-[2px] rounded-full ${
                isPlaying ? "bg-[#FF9500] animate-pulse" : "bg-gray-400"
              }`}
              style={{
                height: `${h}px`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">{duration}&quot;</span>
      </div>
    </div>
  );
}

"use client";

import { Heart, ThermometerSun } from "lucide-react";

interface ScoreBarProps {
  score: number;
  round: number;
  maxRounds: number;
}

export function ScoreBar({ score, round, maxRounds }: ScoreBarProps) {
  const percentage = Math.max(0, Math.min(100, (score + 100) / 2));

  const getStatus = () => {
    if (score >= 60) {
      return {
        label: "心动中",
        fill: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
      };
    }
    if (score >= 30) {
      return {
        label: "开始缓和",
        fill: "bg-lime-500",
        text: "text-lime-700",
        bg: "bg-lime-50",
      };
    }
    if (score >= 0) {
      return {
        label: "还在观察",
        fill: "bg-amber-500",
        text: "text-amber-700",
        bg: "bg-amber-50",
      };
    }
    if (score >= -30) {
      return {
        label: "气氛危险",
        fill: "bg-orange-500",
        text: "text-orange-700",
        bg: "bg-orange-50",
      };
    }
    return {
      label: "拉黑边缘",
      fill: "bg-[#a83246]",
      text: "text-[#a83246]",
      bg: "bg-[#fff0f1]",
    };
  };

  const status = getStatus();

  return (
    <div className="flex-shrink-0 border-b border-[#ded1c7] bg-[#fff8f3]/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div
            className={`inline-flex min-w-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span className="truncate">{status.label}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <ThermometerSun className="h-3.5 w-3.5 text-[#a83246]" />
            第 {round}/{maxRounds} 轮
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e7d8cf]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${status.fill}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

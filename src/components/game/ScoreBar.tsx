"use client";

interface ScoreBarProps {
  score: number;
  round: number;
  maxRounds: number;
}

export function ScoreBar({ score, round, maxRounds }: ScoreBarProps) {
  // 将分数从 -100~100 映射到 0~100
  const percentage = Math.max(0, Math.min(100, (score + 100) / 2));

  // 根据分数决定颜色和状态
  const getColor = () => {
    if (score >= 60) return "bg-green-500";
    if (score >= 30) return "bg-yellow-500";
    if (score >= 0) return "bg-orange-500";
    if (score >= -30) return "bg-red-400";
    return "bg-red-600";
  };

  const getEmoji = () => {
    if (score >= 60) return "😊";
    if (score >= 30) return "😐";
    if (score >= 0) return "😤";
    if (score >= -30) return "😡";
    return "💀";
  };

  const getStatus = () => {
    if (score >= 60) return "心动中";
    if (score >= 30) return "将就";
    if (score >= 0) return "不爽";
    if (score >= -30) return "暴怒";
    return "濒临拉黑";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm px-3 py-2 border-b border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{getEmoji()}</span>
          <span className="text-xs font-medium text-gray-600">
            {getStatus()}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          第 {round}/{maxRounds} 轮
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

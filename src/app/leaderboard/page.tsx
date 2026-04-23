"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCachedUser, authFetch } from "@/lib/auth/client";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  bestScore: number;
  achievedAt: string;
}

interface UserInfo {
  id: number;
  username: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function getScoreColor(score: number): string {
  if (score >= 60) return "text-green-500";
  if (score >= 30) return "text-yellow-500";
  if (score >= 0) return "text-orange-500";
  return "text-red-400";
}

/** 排名奖牌 */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-xl">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-xl">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-xl">🥉</span>;
  }
  return (
    <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-400">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // 尝试带认证信息请求，以便获取 currentUserRank
      const res = await authFetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentUserRank(data.currentUserRank || null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) setUser(cached);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return user && entry.userId === user.id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-amber-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100/60">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <span>🏆</span> 好感度排行榜
          </h1>
          <div className="w-5" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* 前三名展示区 */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6 pt-4">
            {/* 第二名 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                {leaderboard[1].username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-gray-600 mt-1.5 max-w-[64px] truncate">
                {leaderboard[1].username}
              </span>
              <div className="mt-1 bg-gray-200 rounded-t-lg w-20 flex flex-col items-center justify-end pt-2 pb-1.5" style={{ height: 60 }}>
                <span className="text-sm">🥈</span>
                <span className={`text-sm font-bold ${getScoreColor(leaderboard[1].bestScore)}`}>
                  +{leaderboard[1].bestScore}
                </span>
              </div>
            </div>

            {/* 第一名 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-md ring-2 ring-yellow-300/50">
                {leaderboard[0].username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-700 mt-1.5 max-w-[72px] truncate">
                {leaderboard[0].username}
              </span>
              <div className="mt-1 bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-t-lg w-24 flex flex-col items-center justify-end pt-2 pb-1.5" style={{ height: 80 }}>
                <span className="text-lg">🥇</span>
                <span className={`text-base font-bold ${getScoreColor(leaderboard[0].bestScore)}`}>
                  +{leaderboard[0].bestScore}
                </span>
              </div>
            </div>

            {/* 第三名 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                {leaderboard[2].username.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-gray-600 mt-1.5 max-w-[64px] truncate">
                {leaderboard[2].username}
              </span>
              <div className="mt-1 bg-amber-100 rounded-t-lg w-20 flex flex-col items-center justify-end pt-2 pb-1.5" style={{ height: 48 }}>
                <span className="text-sm">🥉</span>
                <span className={`text-sm font-bold ${getScoreColor(leaderboard[2].bestScore)}`}>
                  +{leaderboard[2].bestScore}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-sm text-gray-400 mb-4">还没有排行榜数据</p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-medium rounded-full hover:from-yellow-500 hover:to-amber-600 transition-all"
              >
                去挑战一局
              </Link>
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isCurrentUser(entry)
                    ? "bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 shadow-sm"
                    : "bg-white shadow-sm"
                }`}
              >
                {/* 排名 */}
                <RankBadge rank={entry.rank} />

                {/* 头像+用户名 */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      entry.rank <= 3
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                        : "bg-gradient-to-br from-gray-300 to-gray-400"
                    }`}
                  >
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-sm font-medium truncate block ${
                      isCurrentUser(entry) ? "text-pink-600" : "text-gray-700"
                    }`}>
                      {entry.username}
                      {isCurrentUser(entry) && (
                        <span className="text-xs text-pink-400 ml-1">(我)</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(entry.achievedAt)}
                    </span>
                  </div>
                </div>

                {/* 分数 */}
                <div className={`text-lg font-bold flex-shrink-0 ${getScoreColor(entry.bestScore)}`}>
                  {entry.bestScore > 0 ? "+" : ""}{entry.bestScore}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 当前用户排名（不在 top20 时显示） */}
        {currentUserRank && currentUserRank.rank > 20 && (
          <div className="mt-4">
            <div className="text-center text-xs text-gray-400 mb-2">— 你的排名 —</div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 shadow-sm">
              <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-400">
                {currentUserRank.rank}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUserRank.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-pink-600 truncate block">
                    {currentUserRank.username}
                    <span className="text-xs text-pink-400 ml-1">(我)</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(currentUserRank.achievedAt)}
                  </span>
                </div>
              </div>
              <div className={`text-lg font-bold flex-shrink-0 ${getScoreColor(currentUserRank.bestScore)}`}>
                {currentUserRank.bestScore > 0 ? "+" : ""}{currentUserRank.bestScore}
              </div>
            </div>
          </div>
        )}

        {/* 底部提示 */}
        {!loading && leaderboard.length > 0 && (
          <div className="text-center mt-8 pb-6">
            <p className="text-xs text-gray-400 mb-4">只有登录用户的成绩才会上榜</p>
            {!user && (
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                登录后上榜
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

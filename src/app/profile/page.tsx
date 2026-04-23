"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCachedUser, authFetch, clearAuth } from "@/lib/auth/client";

interface UserInfo {
  id: number;
  username: string;
}

interface GameRecord {
  id: number;
  scenario: string | null;
  final_score: number;
  result: string;
  played_at: string;
}

interface GameStats {
  totalGames: number;
  winCount: number;
  winRate: number;
  bestScore: number;
}

/** 根据用户名生成稳定的渐变色 */
function getAvatarGradient(name: string): string {
  const gradients = [
    "from-rose-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-blue-400 to-indigo-500",
    "from-cyan-400 to-teal-500",
    "from-emerald-400 to-green-500",
    "from-amber-400 to-orange-500",
    "from-fuchsia-400 to-pink-500",
    "from-sky-400 to-blue-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function getScoreEmoji(score: number): string {
  if (score >= 60) return "🎉";
  if (score >= 30) return "😅";
  if (score >= 0) return "😬";
  if (score >= -30) return "😱";
  return "💀";
}

function getScoreColor(score: number): string {
  if (score >= 60) return "text-green-500";
  if (score >= 30) return "text-yellow-500";
  if (score >= 0) return "text-orange-500";
  if (score >= -30) return "text-red-400";
  return "text-red-600";
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchRecords = useCallback(async (p: number) => {
    try {
      const res = await authFetch(`/api/game/records?page=${p}&pageSize=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setTotal(data.total || 0);
        setStats(data.stats || null);
        setPage(p);
      } else if (res.status === 401) {
        // 未登录，跳转登录页
        window.location.href = "/login";
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCachedUser();
    if (!cached) {
      window.location.href = "/login";
      return;
    }
    setUser(cached);
    fetchRecords(1);
  }, [fetchRecords]);

  const handleLogout = async () => {
    clearAuth();
    try {
      await authFetch("/api/auth/me", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  const avatarGradient = user ? getAvatarGradient(user.username) : "";
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pink-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-gray-100/60">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-bold text-gray-800">我的记录</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            退出登录
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 用户信息卡片 */}
        {user && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-5 flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0`}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 truncate">{user.username}</h2>
              <p className="text-xs text-gray-400 mt-0.5">哄她开心玩家</p>
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-gray-800">{stats.totalGames}</div>
              <div className="text-xs text-gray-400 mt-0.5">总局数</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-green-500">{stats.winCount}</div>
              <div className="text-xs text-gray-400 mt-0.5">通关</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-purple-500">{stats.winRate}%</div>
              <div className="text-xs text-gray-400 mt-0.5">胜率</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-orange-500">{stats.bestScore > 0 ? `+${stats.bestScore}` : stats.bestScore}</div>
              <div className="text-xs text-gray-400 mt-0.5">最高分</div>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 px-1">游戏历史</h3>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-sm text-gray-400 mb-4">还没有游戏记录</p>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                去挑战一局
              </Link>
            </div>
          ) : (
            <>
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
                >
                  {/* 表情 */}
                  <div className="text-2xl flex-shrink-0">
                    {getScoreEmoji(record.final_score)}
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {record.scenario || "未知场景"}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          record.result === "通关"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {record.result}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(record.played_at)}
                    </div>
                  </div>
                  {/* 分数 */}
                  <div className={`text-lg font-bold flex-shrink-0 ${getScoreColor(record.final_score)}`}>
                    {record.final_score > 0 ? "+" : ""}{record.final_score}
                  </div>
                </div>
              ))}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => fetchRecords(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-gray-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => fetchRecords(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

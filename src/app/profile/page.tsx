"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  LogOut,
  MessageCircleHeart,
  Play,
  Trophy,
} from "lucide-react";
import { authFetch, clearAuth, getCachedUser } from "@/lib/auth/client";

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

function getAvatarGradient(name: string): string {
  const gradients = [
    "from-[#a83246] to-[#c85d6c]",
    "from-[#8b3b45] to-[#e76f51]",
    "from-[#c85d6c] to-[#7f2335]",
    "from-stone-800 to-[#a83246]",
    "from-emerald-600 to-[#a83246]",
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

function getScoreColor(score: number): string {
  if (score >= 60) return "text-emerald-600";
  if (score >= 30) return "text-lime-600";
  if (score >= 0) return "text-amber-600";
  return "text-[#a83246]";
}

function getScoreLabel(score: number): string {
  if (score >= 60) return "完美救场";
  if (score >= 30) return "气氛回暖";
  if (score >= 0) return "勉强过关";
  if (score >= -30) return "翻车预警";
  return "大型翻车";
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
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f3]">
        <Loader2 className="h-8 w-8 animate-spin text-[#a83246]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f3] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-[#ead8cf]/80 bg-[#fff8f3]/88 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
            aria-label="返回首页"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <History className="h-4 w-4 text-[#a83246]" />
            我的记录
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
            aria-label="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {user && (
          <section className="mb-5 rounded-[8px] border border-[#ead8cf] bg-white/78 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-2xl font-black text-white shadow-lg`}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-bold text-[#a83246]">
                  <MessageCircleHeart className="h-3.5 w-3.5" />
                  哄她开心玩家
                </div>
                <h1 className="truncate text-2xl font-black text-stone-950">
                  {user.username}
                </h1>
              </div>
            </div>
          </section>
        )}

        {stats && (
          <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["总局数", stats.totalGames, "text-stone-900"],
              ["通关", stats.winCount, "text-emerald-600"],
              ["胜率", `${stats.winRate}%`, "text-[#a83246]"],
              [
                "最高分",
                stats.bestScore > 0 ? `+${stats.bestScore}` : stats.bestScore,
                getScoreColor(stats.bestScore),
              ],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-[8px] border border-[#ead8cf] bg-white/78 p-4 shadow-sm"
              >
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="mt-1 text-xs font-medium text-stone-500">
                  {label}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="overflow-hidden rounded-[8px] border border-[#ead8cf] bg-white/82 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f0e4dd] px-4 py-3">
            <h2 className="text-sm font-black text-stone-900">游戏历史</h2>
            <span className="text-xs text-stone-400">共 {total} 条</span>
          </div>

          {records.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
              <Trophy className="mb-3 h-10 w-10 text-[#c85d6c]" />
              <p className="mb-5 text-sm text-stone-500">还没有游戏记录</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#a83246] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#912b3d]"
              >
                <Play className="h-4 w-4 fill-current" />
                去挑战一局
              </Link>
            </div>
          ) : (
            <>
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 border-b border-[#f0e4dd] px-4 py-3 last:border-b-0"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#a83246]">
                    <MessageCircleHeart className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-bold text-stone-800">
                        {record.scenario || "未知场景"}
                      </span>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                          record.result === "通关"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#fff0f1] text-[#a83246]"
                        }`}
                      >
                        {record.result}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-stone-400">
                      {formatDate(record.played_at)} · {getScoreLabel(record.final_score)}
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 text-lg font-black ${getScoreColor(record.final_score)}`}
                  >
                    {record.final_score > 0 ? "+" : ""}
                    {record.final_score}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fetchRecords(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#ead8cf] bg-white px-3 py-2 text-sm font-bold text-stone-600 transition hover:text-[#a83246] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <span className="text-sm text-stone-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchRecords(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#ead8cf] bg-white px-3 py-2 text-sm font-bold text-stone-600 transition hover:text-[#a83246] disabled:cursor-not-allowed disabled:opacity-35"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

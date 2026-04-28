"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Medal,
  MessageCircleHeart,
  Play,
  Trophy,
} from "lucide-react";
import { authFetch, getCachedUser } from "@/lib/auth/client";

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
  if (score >= 60) return "text-emerald-600";
  if (score >= 30) return "text-lime-600";
  if (score >= 0) return "text-amber-600";
  return "text-[#a83246]";
}

function getRankStyle(rank: number): string {
  if (rank === 1) return "bg-amber-100 text-amber-700 border-amber-200";
  if (rank === 2) return "bg-stone-100 text-stone-600 border-stone-200";
  if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-white text-stone-500 border-[#ead8cf]";
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-sm font-black ${getRankStyle(rank)}`}
    >
      {rank <= 3 ? <Medal className="h-4 w-4" /> : rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] =
    useState<LeaderboardEntry | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
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
    return Boolean(user && entry.userId === user.id);
  };

  const topThree = leaderboard.slice(0, 3);

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
            <Trophy className="h-4 w-4 text-[#a83246]" />
            好感度排行榜
          </div>
          <div className="h-9 w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[8px] border border-[#ead8cf] bg-white/72 p-5 shadow-sm">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-bold text-[#a83246]">
            <MessageCircleHeart className="h-3.5 w-3.5" />
            登录玩家最高分
          </div>
          <h1 className="text-3xl font-black tracking-tight text-stone-950">
            谁最会把局面救回来
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            排行榜只记录已登录用户的历史最高好感度。
          </p>
        </section>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-[8px] border border-[#ead8cf] bg-white/60">
            <Loader2 className="h-8 w-8 animate-spin text-[#a83246]" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d9c6bb] bg-white/55 text-center">
            <Trophy className="mb-3 h-10 w-10 text-[#c85d6c]" />
            <p className="mb-5 text-sm text-stone-500">还没有排行榜数据</p>
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
            {topThree.length >= 3 && (
              <section className="mb-6 grid gap-3 sm:grid-cols-3">
                {topThree.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`rounded-[8px] border p-4 shadow-sm ${
                      entry.rank === 1
                        ? "border-amber-200 bg-amber-50"
                        : "border-[#ead8cf] bg-white/78"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <RankBadge rank={entry.rank} />
                      <span className={`text-2xl font-black ${getScoreColor(entry.bestScore)}`}>
                        {entry.bestScore > 0 ? "+" : ""}
                        {entry.bestScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a83246] text-sm font-bold text-white">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-stone-900">
                          {entry.username}
                        </div>
                        <div className="text-xs text-stone-400">
                          {formatDate(entry.achievedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            <section className="overflow-hidden rounded-[8px] border border-[#ead8cf] bg-white/82 shadow-sm">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 border-b border-[#f0e4dd] px-4 py-3 last:border-b-0 ${
                    isCurrentUser(entry) ? "bg-[#fff0f1]" : ""
                  }`}
                >
                  <RankBadge rank={entry.rank} />
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        isCurrentUser(entry) ? "bg-[#a83246]" : "bg-stone-800"
                      }`}
                    >
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`truncate text-sm font-bold ${
                          isCurrentUser(entry)
                            ? "text-[#a83246]"
                            : "text-stone-800"
                        }`}
                      >
                        {entry.username}
                        {isCurrentUser(entry) && (
                          <span className="ml-1 text-xs text-[#c85d6c]">
                            (我)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400">
                        {formatDate(entry.achievedAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 text-lg font-black ${getScoreColor(entry.bestScore)}`}
                  >
                    {entry.bestScore > 0 ? "+" : ""}
                    {entry.bestScore}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {currentUserRank && currentUserRank.rank > 20 && (
          <section className="mt-4 rounded-[8px] border border-[#c85d6c] bg-[#fff0f1] p-4 shadow-sm">
            <div className="mb-2 text-xs font-bold text-[#a83246]">
              你的排名
            </div>
            <div className="flex items-center gap-3">
              <RankBadge rank={currentUserRank.rank} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[#a83246]">
                  {currentUserRank.username} <span className="text-xs">(我)</span>
                </div>
                <div className="text-xs text-stone-400">
                  {formatDate(currentUserRank.achievedAt)}
                </div>
              </div>
              <div className={`text-lg font-black ${getScoreColor(currentUserRank.bestScore)}`}>
                {currentUserRank.bestScore > 0 ? "+" : ""}
                {currentUserRank.bestScore}
              </div>
            </div>
          </section>
        )}

        {!loading && leaderboard.length > 0 && !user && (
          <div className="mt-8 text-center">
            <p className="mb-4 text-xs text-stone-400">
              只有登录用户的成绩才会上榜
            </p>
            <Link
              href="/login"
              className="inline-flex rounded-[8px] bg-[#a83246] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#912b3d]"
            >
              登录后上榜
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

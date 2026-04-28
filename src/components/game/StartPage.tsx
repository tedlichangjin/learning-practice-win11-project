"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Loader2,
  LogOut,
  MessageCircleHeart,
  Play,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { ImageSlider } from "./ImageSlider";
import { getCachedUser, authFetch, clearAuth } from "@/lib/auth/client";
import { HOME_SLIDER_IMAGES, PERSONA_IMAGES } from "@/lib/game/visual-assets";

interface UserInfo {
  id: number;
  username: string;
}

interface StartPageProps {
  onStart: () => void;
  isLoading: boolean;
}

const scenarioTags = ["忘记纪念日", "消息已读不回", "前任点赞", "迟到 40 分钟"];

const chatPreview = [
  { from: "她", text: "你现在解释，是不是有点晚了？" },
  { from: "我", text: "我先认真听你说完。" },
  { from: "她", text: "这句话还算能听。" },
];

function getAvatarGradient(name: string): string {
  const gradients = [
    "from-rose-500 to-[#a83246]",
    "from-[#c85d6c] to-[#7f2335]",
    "from-[#e76f51] to-[#a83246]",
    "from-amber-500 to-[#c85d6c]",
    "from-emerald-500 to-teal-600",
    "from-sky-500 to-cyan-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function StartPage({ onStart, isLoading }: StartPageProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checking, setChecking] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
        setChecking(false);
      }

      const res = await authFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          clearAuth();
        }
      }
    } catch {
      if (!getCachedUser()) {
        setUser(null);
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    clearAuth();
    try {
      await authFetch("/api/auth/me", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  const handleStartChallenge = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    onStart();
  };

  const avatarGradient = useMemo(
    () => (user ? getAvatarGradient(user.username) : ""),
    [user]
  );

  const isLoggedIn = Boolean(!checking && user);

  return (
    <div className="min-h-screen bg-[#fff8f3] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-[#ead8cf]/80 bg-[#fff8f3]/86 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a83246] text-white">
              <MessageCircleHeart className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold">哄她开心</span>
          </div>

          {checking ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#a83246]" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white/70 py-1 pl-1 pr-3 text-sm font-medium text-stone-700 transition hover:bg-white"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-xs font-bold text-white`}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[96px] truncate">{user.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-white hover:text-[#a83246]"
                aria-label="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#a83246] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#912b3d]"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(420px,1fr)] lg:px-8">
        <section className="order-2 lg:order-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#8b3b45]">
            <Sparkles className="h-3.5 w-3.5" />
            3-5 轮短局恋爱危机
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-stone-950 sm:text-5xl">
            哄她开心，也可能哄到翻车。
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-stone-600 sm:text-base">
            随机场景、不同人设、语音和自拍反馈都会改变这场对话的温度。
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {scenarioTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#ead8cf] bg-white/75 px-3 py-1 text-xs font-medium text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["随机场景", "每局冲突都不同"],
              ["真实反馈", "文字、语音、自拍"],
              ["戏剧结算", "生成分享文案"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-[8px] border border-[#ead8cf] bg-white/72 p-4 shadow-sm"
              >
                <div className="text-sm font-bold text-stone-800">{title}</div>
                <div className="mt-1 text-xs text-stone-500">{desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleStartChallenge}
              disabled={isLoading && isLoggedIn}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#a83246] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#a83246]/20 transition hover:bg-[#912b3d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && isLoggedIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在生成场景...
                </>
              ) : isLoggedIn ? (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  开始挑战
                </>
              ) : (
                <>
                  <UserRound className="h-4 w-4" />
                  登录后开始挑战
                </>
              )}
            </button>
            <Link
              href="/share"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#f0c3b1] bg-white/76 px-5 py-3 text-sm font-bold text-[#b64b3a] shadow-sm transition hover:bg-white"
            >
              <Flame className="h-4 w-4" />
              翻车现场
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#ead8cf] bg-white/76 px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-white"
            >
              <Trophy className="h-4 w-4 text-amber-600" />
              排行榜
            </Link>
          </div>

          {!checking && !user && (
            <p className="mt-4 text-sm text-stone-500">
              还没有账号？{" "}
              <Link
                href="/register"
                className="font-semibold text-[#a83246] hover:text-[#812235]"
              >
                立即注册
              </Link>
            </p>
          )}
        </section>

        <section className="order-1 grid gap-3 lg:order-2">
          <div className="relative h-[430px] overflow-hidden rounded-[8px] border border-white shadow-[0_24px_90px_rgba(91,42,48,0.18)] sm:h-[560px]">
            <ImageSlider images={HOME_SLIDER_IMAGES} interval={3600} />
            <div className="absolute left-4 top-4 rounded-[8px] bg-white/86 px-3 py-2 text-xs font-semibold text-[#8b3b45] backdrop-blur">
              今日危机：已读不回
            </div>
            <div className="absolute bottom-5 left-5 right-5 space-y-2">
              {chatPreview.map((item) => (
                <div
                  key={`${item.from}-${item.text}`}
                  className={`max-w-[86%] rounded-[8px] px-3 py-2 text-sm shadow-sm backdrop-blur ${
                    item.from === "我"
                      ? "ml-auto bg-[#95EC69]/92 text-stone-800"
                      : "bg-white/88 text-stone-800"
                  }`}
                >
                  <span className="mr-1 text-xs font-bold text-[#a83246]">
                    {item.from}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {PERSONA_IMAGES.slice(0, 4).map((src, index) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-[8px] border border-white bg-white shadow-sm"
              >
                <Image
                  src={src}
                  alt={`角色照片 ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 120px"
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

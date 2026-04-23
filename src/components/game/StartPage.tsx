"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getCachedUser, authFetch, clearAuth } from "@/lib/auth/client";

interface UserInfo {
  id: number;
  username: string;
}

interface StartPageProps {
  onStart: () => void;
  isLoading: boolean;
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

export function StartPage({ onStart, isLoading }: StartPageProps) {
  // 优先从 localStorage 缓存初始化，避免闪烁
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checking, setChecking] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // 先从 localStorage 缓存同步读取（秒出，无闪烁）
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
        setChecking(false);
      }

      // 再通过 API 校验 token 有效性
      const res = await authFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          // token 无效，清除 localStorage
          setUser(null);
          clearAuth();
        }
      }
    } catch {
      // 网络错误时，如果 localStorage 有缓存，仍然使用缓存
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

  const isLoggedIn = !checking && user;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* ===== 顶部导航栏 ===== */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-gray-100/60">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          {/* 左侧 Logo */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg">💬</span>
            <span className="text-sm font-bold text-gray-800">哄她开心</span>
          </div>

          {/* 右侧用户区 */}
          {checking ? (
            <div className="w-5 h-5 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[60px] truncate">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors ml-1"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ===== 主内容区 ===== */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo / 标题区 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">哄她开心</h1>
          <p className="text-sm text-gray-500">一场关于情商的极限挑战</p>
        </div>

        {/* 特性卡片 */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm">
            <span className="text-2xl">🎭</span>
            <div>
              <div className="text-sm font-medium text-gray-700">随机场景</div>
              <div className="text-xs text-gray-400">每次开局都是新的冲突</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm">
            <span className="text-2xl">🎙️</span>
            <div>
              <div className="text-sm font-medium text-gray-700">真实对话</div>
              <div className="text-xs text-gray-400">语音+文字+自拍，沉浸式聊天</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-sm font-medium text-gray-700">短局快玩</div>
              <div className="text-xs text-gray-400">3-5轮出结果，截图分享</div>
            </div>
          </div>
        </div>

        {/* 开始挑战按钮 */}
        <button
          onClick={handleStartChallenge}
          disabled={isLoading && !!isLoggedIn}
          className={`w-full max-w-sm py-4 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${
            isLoggedIn
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              : "bg-gradient-to-r from-pink-400 to-purple-400 text-white/80 hover:from-pink-500 hover:to-purple-500"
          }`}
        >
          {isLoading && isLoggedIn ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              正在生成场景...
            </span>
          ) : isLoggedIn ? (
            "开始挑战"
          ) : (
            <span className="flex items-center justify-center gap-2">
              登录后开始挑战
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </button>

        {/* 提示 */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          本游戏纯属娱乐，不代表真实恋爱建议
        </p>

        {/* ===== 底部入口区 ===== */}
        <div className="w-full max-w-sm mt-6 space-y-3">
          {/* 翻车现场入口 */}
          <Link
            href="/share"
            className="w-full py-3 flex items-center justify-center gap-2 bg-white border border-orange-200 rounded-2xl text-sm font-medium text-orange-500 hover:bg-orange-50 transition-all active:scale-[0.98]"
          >
            <span className="text-lg">🔥</span>
            翻车现场
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* 排行榜入口 */}
          <Link
            href="/leaderboard"
            className="w-full py-3 flex items-center justify-center gap-2 bg-white border border-yellow-200 rounded-2xl text-sm font-medium text-yellow-600 hover:bg-yellow-50 transition-all active:scale-[0.98]"
          >
            <span className="text-lg">🏆</span>
            排行榜
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 未登录时的注册引导 */}
        {!checking && !user && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            还没有账号？{" "}
            <Link href="/register" className="text-purple-500 hover:text-purple-600 font-medium transition-colors">
              立即注册
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

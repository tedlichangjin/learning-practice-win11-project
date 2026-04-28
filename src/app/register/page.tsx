"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  MessageCircleHeart,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ImageSlider } from "@/components/game/ImageSlider";
import { REGISTER_SLIDER_IMAGES } from "@/lib/game/visual-assets";
import { saveAuth } from "@/lib/auth/client";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("请输入用户名和密码");
      return;
    }

    if (username.trim().length < 2) {
      setError("用户名至少 2 个字符");
      return;
    }

    if (password.length < 6) {
      setError("密码至少 6 个字符");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }

      if (data.token && data.user) {
        saveAuth(data.token, data.user);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8f3] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a83246] text-white">
              <MessageCircleHeart className="h-4 w-4" />
            </span>
            哄她开心
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8cf] bg-white/70 px-3 py-1.5 text-sm font-medium text-[#8b3b45] shadow-sm transition hover:border-[#d9aaa4] hover:bg-white"
          >
            去登录
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:gap-10">
          <div className="relative h-[340px] overflow-hidden rounded-[8px] border border-white/70 shadow-[0_24px_80px_rgba(91,42,48,0.16)] sm:h-[460px] lg:h-[660px]">
            <ImageSlider images={REGISTER_SLIDER_IMAGES} interval={4600} />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                加入这场对话实验
              </div>
              <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-5xl">
                保存每一次救场和翻车。
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/82">
                注册后可记录成绩、进入排行榜，并把结局分享到翻车现场。
              </p>
            </div>
          </div>

          <div className="rounded-[8px] border border-[#eddcd3] bg-white/86 p-5 shadow-[0_18px_60px_rgba(91,42,48,0.12)] backdrop-blur sm:p-7">
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#a83246] text-white shadow-lg shadow-[#a83246]/20">
                <UserRound className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-950">
                创建账号
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                用一个昵称开始挑战，后续游戏记录会自动保存到个人页。
              </p>
            </div>

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                注册成功，正在跳转...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  用户名
                </span>
                <div className="flex items-center gap-2 rounded-[8px] border border-[#ead8cf] bg-white px-3 py-3 transition focus-within:border-[#c85d6c] focus-within:ring-4 focus-within:ring-[#c85d6c]/10">
                  <UserRound className="h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="2-50 个字符"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
                    autoComplete="username"
                    disabled={success}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  密码
                </span>
                <div className="flex items-center gap-2 rounded-[8px] border border-[#ead8cf] bg-white px-3 py-3 transition focus-within:border-[#c85d6c] focus-within:ring-4 focus-within:ring-[#c85d6c]/10">
                  <LockKeyhole className="h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 个字符"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
                    autoComplete="new-password"
                    disabled={success}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  确认密码
                </span>
                <div className="flex items-center gap-2 rounded-[8px] border border-[#ead8cf] bg-white px-3 py-3 transition focus-within:border-[#c85d6c] focus-within:ring-4 focus-within:ring-[#c85d6c]/10">
                  <LockKeyhole className="h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
                    autoComplete="new-password"
                    disabled={success}
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || success}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#a83246] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#a83246]/20 transition hover:bg-[#912b3d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "注册中..." : "注册并开始"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-500">
              已有账号？{" "}
              <Link
                href="/login"
                className="font-semibold text-[#a83246] hover:text-[#812235]"
              >
                去登录
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { saveAuth } from "@/lib/auth/client";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        setLoading(false);
        return;
      }

      // 将 token 和用户信息存入 localStorage
      if (data.token && data.user) {
        saveAuth(data.token, data.user);
      }

      // 显示成功提示，延迟后硬跳转
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-sm text-gray-400 mt-1">登录后继续哄她开心</p>
        </div>

        {/* 登录成功提示 */}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 text-center mb-4 flex items-center justify-center gap-2 animate-[fadeIn_0.3s_ease-in]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            登录成功，正在跳转...
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              autoComplete="username"
              disabled={success}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              autoComplete="current-password"
              disabled={success}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        {/* 切换到注册 */}
        <p className="text-center text-sm text-gray-400 mt-6">
          还没有账号？{" "}
          <Link
            href="/register"
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            去注册
          </Link>
        </p>
      </div>
    </div>
  );
}

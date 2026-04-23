"use client";

import type { GameResult, ChatMessage } from "@/lib/game/types";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCachedUser, authFetch } from "@/lib/auth/client";

interface UserInfo {
  id: number;
  username: string;
}

interface ResultPageProps {
  result: GameResult;
  messages: ChatMessage[];
  personalityName: string;
  personalityType?: string;
  scenarioTitle?: string;
  onRestart: () => void;
}

export function ResultPage({
  result,
  messages,
  personalityName,
  personalityType,
  scenarioTitle,
  onRestart,
}: ResultPageProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [recordSaved, setRecordSaved] = useState(false);
  const [recordSaving, setRecordSaving] = useState(false);
  const [showRecordToast, setShowRecordToast] = useState(false);
  const [recordToastMsg, setRecordToastMsg] = useState("");

  // 获取当前登录用户
  const fetchUser = useCallback(async () => {
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
      return;
    }
    try {
      const res = await authFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 游戏结束后自动保存记录
  useEffect(() => {
    if (recordSaved || recordSaving) return;

    const saveRecord = async () => {
      setRecordSaving(true);
      const currentUser = getCachedUser() || user;

      if (!currentUser) {
        // 未登录提示
        setRecordToastMsg("登录后可保存你的游戏记录");
        setShowRecordToast(true);
        setRecordSaving(false);
        return;
      }

      try {
        const gameResult = result.finalScore >= 0 ? "通关" : "失败";
        const res = await authFetch("/api/game/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: scenarioTitle || null,
            final_score: result.finalScore,
            result: gameResult,
          }),
        });

        if (res.ok) {
          setRecordSaved(true);
          setRecordToastMsg("您的游戏记录已经保存");
        } else {
          setRecordToastMsg("记录保存失败，请稍后重试");
        }
      } catch {
        setRecordToastMsg("网络错误，记录保存失败");
      }
      setShowRecordToast(true);
      setRecordSaving(false);
    };

    // 延迟 1 秒后保存，确保页面已渲染
    const timer = setTimeout(saveRecord, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 自动隐藏 toast
  useEffect(() => {
    if (!showRecordToast) return;
    const timer = setTimeout(() => setShowRecordToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showRecordToast]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = result.shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleScreenshot = () => {
    alert("请使用手机截图或电脑截屏功能保存结果");
  };

  const handleShareToSquare = async () => {
    if (shared || sharing) return;
    setSharing(true);

    try {
      const chatLines = messages
        .map((m) => `**${m.role === "partner" ? "她" : "我"}：** ${m.text}`)
        .join("\n\n");

      const content = `## ${result.title}\n\n${result.description}\n\n${chatLines}\n\n> ${result.shareText}`;

      const chatMessages = JSON.stringify(
        messages.map((m) => ({ role: m.role, text: m.text }))
      );

      const coverImage = messages.find(
        (m) => m.role === "partner" && m.imageUrl
      )?.imageUrl;

      const res = await authFetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.shareText,
          content,
          cover_image_url: coverImage || null,
          author_name: user?.username || "匿名玩家",
          personality_type: personalityType || null,
          scenario_title: scenarioTitle || null,
          final_score: result.finalScore,
          result_title: result.title,
          share_text: result.shareText,
          chat_messages: chatMessages,
        }),
      });

      if (!res.ok) throw new Error("Share failed");
      setShared(true);
    } catch (error) {
      console.error("Share to square error:", error);
    } finally {
      setSharing(false);
    }
  };

  // 分数等级
  const getScoreLevel = () => {
    if (result.finalScore >= 60) return { emoji: "🎉", color: "text-green-500", bg: "bg-green-50" };
    if (result.finalScore >= 30) return { emoji: "😅", color: "text-yellow-500", bg: "bg-yellow-50" };
    if (result.finalScore >= 0) return { emoji: "😬", color: "text-orange-500", bg: "bg-orange-50" };
    if (result.finalScore >= -30) return { emoji: "😱", color: "text-red-400", bg: "bg-red-50" };
    return { emoji: "💀", color: "text-red-600", bg: "bg-red-100" };
  };

  const level = getScoreLevel();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Toast 提示 */}
      {showRecordToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.3s_ease-in]">
          <div className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
            recordSaved
              ? "bg-green-500 text-white"
              : recordToastMsg.includes("登录")
              ? "bg-amber-500 text-white"
              : "bg-red-500 text-white"
          }`}>
            <span>{recordSaved ? "✅" : recordToastMsg.includes("登录") ? "💡" : "⚠️"}</span>
            {recordToastMsg}
          </div>
        </div>
      )}

      {/* 顶部 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center">
        <button
          onClick={onRestart}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="flex-1 text-center text-sm font-medium text-gray-800">
          对话结果
        </span>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* 结果卡片 */}
        <div className={`w-full max-w-sm rounded-2xl ${level.bg} p-6 shadow-sm mb-6`}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{level.emoji}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {result.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {result.description}
            </p>
          </div>

          {/* 分数 */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-200/50">
            <span className="text-sm text-gray-500">好感度</span>
            <span className={`text-2xl font-bold ${level.color}`}>
              {result.finalScore > 0 ? "+" : ""}
              {result.finalScore}
            </span>
          </div>

          {/* 对话统计 */}
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200/50">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                {messages.filter((m) => m.role === "user").length}
              </div>
              <div className="text-xs text-gray-500">对话轮数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                {messages.filter((m) => m.audioUrl).length}
              </div>
              <div className="text-xs text-gray-500">语音消息</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                {messages.filter((m) => m.imageUrl).length}
              </div>
              <div className="text-xs text-gray-500">自拍</div>
            </div>
          </div>
        </div>

        {/* 分享文案 */}
        <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs font-medium text-gray-500">分享文案</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.shareText}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={handleShareToSquare}
            disabled={shared || sharing}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
              shared
                ? "bg-gray-200 text-gray-500"
                : sharing
                ? "bg-orange-400 text-white opacity-70"
                : "bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600"
            }`}
          >
            {shared ? "已分享到翻车现场" : sharing ? "分享中..." : "分享到翻车现场"}
          </button>
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-[#07C160] text-white rounded-xl text-sm font-medium hover:bg-[#06AD56] transition-colors active:scale-[0.98]"
          >
            {copied ? "已复制!" : "复制分享文案"}
          </button>
          <button
            onClick={handleScreenshot}
            className="w-full py-3 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            截图保存
          </button>
          <button
            onClick={onRestart}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all active:scale-[0.98]"
          >
            再来一局
          </button>
          {shared && (
            <Link
              href="/share"
              className="w-full py-3 text-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              去翻车现场看看 &rarr;
            </Link>
          )}
          {/* 已登录时，查看历史记录入口 */}
          {user && (
            <Link
              href="/profile"
              className="w-full py-3 text-center text-sm font-medium text-purple-500 hover:text-purple-600 transition-colors"
            >
              查看我的游戏记录 &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

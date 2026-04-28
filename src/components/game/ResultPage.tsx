"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Flame,
  History,
  MessageCircleHeart,
  RotateCcw,
  Share2,
  Skull,
  Sparkles,
} from "lucide-react";
import type { ChatMessage, GameResult } from "@/lib/game/types";
import { getCachedUser, authFetch } from "@/lib/auth/client";
import { ImageSlider } from "./ImageSlider";
import { RESULT_SLIDER_IMAGES } from "@/lib/game/visual-assets";

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

  useEffect(() => {
    if (recordSaved || recordSaving) return;

    const saveRecord = async () => {
      setRecordSaving(true);
      const currentUser = getCachedUser() || user;

      if (!currentUser) {
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

    const timer = setTimeout(saveRecord, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const getScoreLevel = (): {
    Icon: LucideIcon;
    color: string;
    bg: string;
    label: string;
  } => {
    if (result.finalScore >= 60) {
      return {
        Icon: Sparkles,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        label: "完美救场",
      };
    }
    if (result.finalScore >= 30) {
      return {
        Icon: CheckCircle2,
        color: "text-lime-600",
        bg: "bg-lime-50",
        label: "气氛回暖",
      };
    }
    if (result.finalScore >= 0) {
      return {
        Icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50",
        label: "勉强过关",
      };
    }
    if (result.finalScore >= -30) {
      return {
        Icon: Flame,
        color: "text-orange-600",
        bg: "bg-orange-50",
        label: "翻车预警",
      };
    }
    return {
      Icon: Skull,
      color: "text-[#a83246]",
      bg: "bg-[#fff0f1]",
      label: "大型翻车",
    };
  };

  const level = getScoreLevel();
  const LevelIcon = level.Icon;

  return (
    <div className="min-h-screen bg-[#fff8f3] text-stone-900">
      {showRecordToast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <div
            className={`flex items-center gap-2 rounded-[8px] px-4 py-3 text-sm font-medium shadow-lg ${
              recordSaved
                ? "bg-emerald-600 text-white"
                : recordToastMsg.includes("登录")
                  ? "bg-amber-600 text-white"
                  : "bg-[#a83246] text-white"
            }`}
          >
            {recordSaved ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {recordToastMsg}
          </div>
        </div>
      )}

      <header className="border-b border-[#ead8cf]/80 bg-[#fff8f3]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
            aria-label="返回"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            <MessageCircleHeart className="h-4 w-4 text-[#a83246]" />
            对话结果
          </div>
          <div className="h-9 w-9" />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:min-h-[calc(100vh-3.5rem)] lg:grid-cols-[minmax(360px,0.78fr)_minmax(0,1fr)] lg:px-8">
        <section className="rounded-[8px] border border-[#ead8cf] bg-white/78 p-5 shadow-[0_18px_70px_rgba(91,42,48,0.12)] backdrop-blur sm:p-7">
          <div
            className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${level.bg} ${level.color}`}
          >
            <LevelIcon className="h-3.5 w-3.5" />
            {level.label}
          </div>

          <h1 className="text-3xl font-black leading-tight text-stone-950">
            {result.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {result.description}
          </p>

          <div className="mt-6 rounded-[8px] border border-[#ead8cf] bg-[#fff8f3] p-4">
            <div className="text-xs font-semibold text-stone-500">
              本局好感度
            </div>
            <div className={`mt-2 text-4xl font-black ${level.color}`}>
              {result.finalScore > 0 ? "+" : ""}
              {result.finalScore}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["对话轮数", messages.filter((m) => m.role === "user").length],
              ["语音消息", messages.filter((m) => m.audioUrl).length],
              ["自拍", messages.filter((m) => m.imageUrl).length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[8px] border border-[#ead8cf] bg-white p-3 text-center"
              >
                <div className="text-lg font-black text-stone-900">
                  {value}
                </div>
                <div className="mt-1 text-xs text-stone-500">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[8px] border border-[#ead8cf] bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#a83246]">
              <Share2 className="h-3.5 w-3.5" />
              分享文案
            </div>
            <p className="text-sm leading-7 text-stone-700">
              {result.shareText}
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={handleShareToSquare}
              disabled={shared || sharing}
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                shared
                  ? "bg-stone-200 text-stone-500"
                  : "bg-[#a83246] text-white shadow-lg shadow-[#a83246]/20 hover:bg-[#912b3d]"
              }`}
            >
              <Flame className="h-4 w-4" />
              {shared ? "已分享到翻车现场" : sharing ? "分享中..." : "分享到翻车现场"}
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[#d9c6bb] bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:text-[#a83246]"
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "已复制" : "复制文案"}
              </button>
              <button
                type="button"
                onClick={handleScreenshot}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[#d9c6bb] bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:text-[#a83246]"
              >
                <Share2 className="h-4 w-4" />
                截图保存
              </button>
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-stone-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              <RotateCcw className="h-4 w-4" />
              再来一局
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            {shared && (
              <Link href="/share" className="text-[#a83246] hover:text-[#812235]">
                去翻车现场看看
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 text-[#a83246] hover:text-[#812235]"
              >
                <History className="h-4 w-4" />
                查看我的游戏记录
              </Link>
            )}
          </div>
        </section>

        <section className="hidden h-[620px] overflow-hidden rounded-[8px] border border-white shadow-[0_24px_90px_rgba(91,42,48,0.18)] lg:block">
          <div className="relative h-full">
            <ImageSlider images={RESULT_SLIDER_IMAGES} interval={3900} />
            <div className="absolute bottom-5 left-5 right-5 rounded-[8px] bg-white/88 p-5 shadow-sm backdrop-blur">
              <div className="text-xs font-semibold text-[#a83246]">
                {personalityName}
              </div>
              <div className="mt-1 text-xl font-black text-stone-950">
                {scenarioTitle || "本局剧情"}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                分享出去，让大家看看这局到底是救场还是翻车。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

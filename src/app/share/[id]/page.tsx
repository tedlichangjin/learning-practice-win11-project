"use client";

import * as React from "react";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clipboard,
  Heart,
  Loader2,
  MessageCircleHeart,
  Share2,
} from "lucide-react";
import { getCommunityFallbackImage } from "@/lib/game/visual-assets";

interface SharePostDetail {
  id: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  personality_type: string | null;
  scenario_title: string | null;
  final_score: number | null;
  result_title: string | null;
  share_text: string | null;
  chat_messages: string | null;
  like_count: number;
  created_at: string;
}

interface ChatMsg {
  role: "user" | "partner";
  text: string;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={key++}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
    }
    parts.push(
      <strong key={key++} className="font-semibold text-stone-950">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<React.Fragment key={key++}>{text.slice(lastIndex)}</React.Fragment>);
  }
  return parts.length > 0 ? parts : [text];
}

function MarkdownContent({ content }: { content: string }) {
  const normalized = content.replace(/\\n/g, "\n");
  const lines = normalized.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const text = paragraphLines.join("\n");
    elements.push(
      <p key={key++} className="mb-3 text-sm leading-7 text-stone-700">
        {renderInline(text)}
      </p>
    );
    paragraphLines = [];
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      elements.push(
        <h2 key={key++} className="mb-3 mt-6 text-lg font-black text-stone-950">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      elements.push(
        <blockquote
          key={key++}
          className="my-4 rounded-r-[8px] border-l-4 border-[#c85d6c] bg-[#fff0f1] py-2 pl-3 text-sm leading-7 text-stone-700"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }
    paragraphLines.push(line);
  }
  flushParagraph();

  return <>{elements}</>;
}

export default function ShareDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<SharePostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/share/${id}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setPost(data);
        setLikeCount(data.like_count);
      } catch (error) {
        console.error("Fetch post error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await fetch(`/api/share/${id}`, { method: "PATCH" });
      if (!res.ok) return;
      const data = await res.json();
      setLiked(true);
      setLikeCount(data.like_count);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleCopyShare = async () => {
    if (!post?.share_text) return;
    try {
      await navigator.clipboard.writeText(post.share_text);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      // fallback omitted; existing behavior was no-op when clipboard fails.
    }
  };

  const parseChatMessages = (raw: string | null): ChatMsg[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const getScoreTone = (score: number | null) => {
    if (score === null) return "bg-stone-100 text-stone-500";
    if (score >= 60) return "bg-emerald-50 text-emerald-700";
    if (score >= 30) return "bg-lime-50 text-lime-700";
    if (score >= 0) return "bg-amber-50 text-amber-700";
    return "bg-[#fff0f1] text-[#a83246]";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f3]">
        <Loader2 className="h-8 w-8 animate-spin text-[#a83246]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8f3] px-4 text-center">
        <MessageCircleHeart className="mb-3 h-10 w-10 text-[#a83246]" />
        <p className="text-sm text-stone-500">分享不存在或已删除</p>
        <Link
          href="/share"
          className="mt-4 rounded-[8px] bg-[#a83246] px-5 py-2.5 text-sm font-bold text-white"
        >
          返回翻车现场
        </Link>
      </div>
    );
  }

  const chatMessages = parseChatMessages(post.chat_messages);
  const cover = post.cover_image_url || getCommunityFallbackImage(post.id);

  return (
    <div className="min-h-screen bg-[#fff8f3] pb-20 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-[#ead8cf]/80 bg-[#fff8f3]/88 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/share"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
            aria-label="返回翻车现场"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <MessageCircleHeart className="h-4 w-4 text-[#a83246]" />
            分享详情
          </div>
          <button
            type="button"
            onClick={handleCopyShare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
            aria-label="复制分享"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <article className="min-w-0 overflow-hidden rounded-[8px] border border-[#ead8cf] bg-white/82 shadow-sm">
          <div className="relative h-[260px] bg-stone-100 sm:h-[380px]">
            <Image
              src={cover}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover object-top"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {post.scenario_title && (
                  <span className="rounded-full bg-white/88 px-2.5 py-1 text-xs font-bold text-[#a83246] backdrop-blur">
                    {post.scenario_title}
                  </span>
                )}
                {post.result_title && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur ${getScoreTone(post.final_score)}`}
                  >
                    {post.result_title}
                  </span>
                )}
              </div>
              <h1 className="line-clamp-3 text-2xl font-black leading-tight text-white sm:text-4xl">
                {post.title}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#f0e4dd] pb-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#a83246] text-sm font-bold text-white">
                  {post.author_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-stone-900">
                    {post.author_name}
                  </div>
                  <div className="text-xs text-stone-400">
                    {new Date(post.created_at).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-black ${getScoreTone(post.final_score)}`}
              >
                {post.final_score !== null
                  ? `${post.final_score > 0 ? "+" : ""}${post.final_score}`
                  : "--"}
              </span>
            </div>

            <MarkdownContent content={post.content} />
          </div>
        </article>

        <aside className="grid gap-4 lg:content-start">
          {chatMessages.length > 0 && (
            <section className="rounded-[8px] border border-[#ead8cf] bg-[#f2ebe4] p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-black text-stone-900">
                对话回放
              </h2>
              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={`${msg.role}-${i}`}
                    className={`flex ${
                      msg.role === "partner" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[84%] rounded-[8px] px-3 py-2 text-sm leading-6 shadow-sm ${
                        msg.role === "partner"
                          ? "border border-[#ead8cf] bg-white text-stone-800"
                          : "bg-[#95EC69] text-stone-900"
                      }`}
                    >
                      {msg.text.startsWith("[自拍照]") ? (
                        <span className="text-stone-400">[自拍照]</span>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {post.share_text && (
            <section className="rounded-[8px] border border-[#ead8cf] bg-white/82 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#a83246]">
                <Clipboard className="h-3.5 w-3.5" />
                分享文案
              </div>
              <p className="text-sm leading-7 text-stone-700">
                {post.share_text}
              </p>
            </section>
          )}
        </aside>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#ead8cf] bg-[#fff8f3]/92 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-4 py-2.5 text-sm font-bold transition ${
              liked
                ? "bg-[#fff0f1] text-[#a83246]"
                : "bg-white text-stone-600 hover:text-[#a83246]"
            }`}
          >
            <Heart className={liked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            {likeCount}
          </button>
          <button
            type="button"
            onClick={handleCopyShare}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#a83246] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#a83246]/20 transition hover:bg-[#912b3d]"
          >
            <Share2 className="h-4 w-4" />
            复制分享
          </button>
        </div>
      </div>

      {showShareToast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          已复制到剪贴板
        </div>
      )}
    </div>
  );
}

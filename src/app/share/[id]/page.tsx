"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import React from "react";

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

/** 将带内联加粗的文本渲染为 React 节点 */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // 匹配 **加粗** 片段
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // match 之前的普通文本
    if (match.index > lastIndex) {
      parts.push(<React.Fragment key={key++}>{text.slice(lastIndex, match.index)}</React.Fragment>);
    }
    // 加粗文本
    parts.push(<strong key={key++} className="font-semibold text-gray-800">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  // 尾部普通文本
  if (lastIndex < text.length) {
    parts.push(<React.Fragment key={key++}>{text.slice(lastIndex)}</React.Fragment>);
  }
  return parts.length > 0 ? parts : [text];
}

/** 轻量 Markdown 渲染器：支持 ## 标题、**加粗**、> 引用、空行分段 */
function MarkdownContent({ content }: { content: string }) {
  // 数据库里的 \n 可能是字面量 "\n"（两个字符），先统一转成真正的换行
  const normalized = content.replace(/\\n/g, "\n");
  const lines = normalized.split("\n");

  const elements: React.ReactNode[] = [];
  let key = 0;
  // 收集连续的普通文本行，合并成一个 <p>
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const text = paragraphLines.join("\n");
    elements.push(
      <p key={key++} className="text-gray-700 leading-relaxed mb-3">
        {renderInline(text)}
      </p>
    );
    paragraphLines = [];
  };

  for (const line of lines) {
    // 空行 → 分段
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }
    // ## 标题
    if (line.startsWith("## ")) {
      flushParagraph();
      elements.push(
        <h2 key={key++} className="text-lg font-bold text-gray-800 mt-6 mb-3">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    // > 引用
    if (line.startsWith("> ")) {
      flushParagraph();
      elements.push(
        <blockquote
          key={key++}
          className="border-l-4 border-pink-300 pl-3 py-1 my-3 bg-pink-50/50 rounded-r text-gray-600 italic"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }
    // 普通行 → 积攒到段落
    paragraphLines.push(line);
  }
  flushParagraph();

  return <>{elements}</>;
}

export default function ShareDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      // fallback
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

  const getScoreEmoji = (score: number | null) => {
    if (score === null) return "🎭";
    if (score >= 60) return "🎉";
    if (score >= 30) return "😅";
    if (score >= 0) return "😬";
    if (score >= -30) return "😱";
    return "💀";
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 60) return "text-green-500";
    if (score >= 30) return "text-yellow-500";
    if (score >= 0) return "text-orange-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <svg className="w-8 h-8 animate-spin text-pink-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <span className="text-4xl mb-3">📭</span>
        <p className="text-gray-400 text-sm">分享不存在或已删除</p>
        <Link href="/share" className="mt-4 text-pink-500 text-sm hover:underline">
          返回翻车现场
        </Link>
      </div>
    );
  }

  const chatMessages = parseChatMessages(post.chat_messages);

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/share" className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-medium text-gray-800">分享详情</h1>
          <button
            onClick={handleCopyShare}
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 博客内容 */}
      <div className="px-4 py-6">
        {/* 标题区 */}
        <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
          {post.title}
        </h1>

        {/* 元信息 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {post.author_name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">{post.author_name}</div>
            <div className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-5">
          {post.scenario_title && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
              {post.scenario_title}
            </span>
          )}
          {post.personality_type && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
              {post.personality_type}
            </span>
          )}
          {post.result_title && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              (post.final_score ?? 0) >= 30
                ? "bg-green-50 text-green-600"
                : (post.final_score ?? 0) >= 0
                ? "bg-yellow-50 text-yellow-600"
                : "bg-red-50 text-red-500"
            }`}>
              {post.result_title}
            </span>
          )}
        </div>

        {/* 分数 */}
        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-gray-50">
          <span className="text-2xl">{getScoreEmoji(post.final_score)}</span>
          <div>
            <div className="text-xs text-gray-400">最终好感度</div>
            <div className={`text-lg font-bold ${getScoreColor(post.final_score)}`}>
              {post.final_score !== null ? `${post.final_score > 0 ? '+' : ''}${post.final_score}` : '--'}
            </div>
          </div>
        </div>

        {/* 封面图 */}
        {post.cover_image_url && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt="封面"
              width={600}
              height={400}
              className="w-full object-cover"
              unoptimized
            />
          </div>
        )}

        {/* 正文内容 - 渲染 Markdown */}
        <article className="mb-8">
          <MarkdownContent content={post.content} />
        </article>

        {/* 对话记录 */}
        {chatMessages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base font-bold text-gray-800 mb-3">对话回放</h3>
            <div className="bg-[#EDEDED] rounded-2xl p-4 space-y-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "partner" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "partner"
                        ? "bg-white text-gray-800"
                        : "bg-[#95EC69] text-gray-800"
                    }`}
                  >
                    {msg.text.startsWith("[自拍照]") ? (
                      <span className="text-gray-400 italic">[自拍照]</span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分享文案 */}
        {post.share_text && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-xs font-medium text-gray-500">分享文案</span>
            </div>
            <p className="text-sm text-gray-600">{post.share_text}</p>
          </div>
        )}
      </div>

      {/* 底部互动栏 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
            liked
              ? "bg-red-50 text-red-500"
              : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm font-medium">{likeCount}</span>
        </button>
        <button
          onClick={handleCopyShare}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full text-sm font-medium hover:from-pink-600 hover:to-orange-500 transition-all active:scale-[0.98]"
        >
          复制分享
        </button>
      </div>

      {/* 复制成功提示 */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-bounce">
          已复制到剪贴板
        </div>
      )}
    </div>
  );
}

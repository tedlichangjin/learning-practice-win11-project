"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface SharePost {
  id: number;
  title: string;
  author_name: string;
  personality_type: string | null;
  scenario_title: string | null;
  final_score: number | null;
  result_title: string | null;
  like_count: number;
  cover_image_url: string | null;
  created_at: string;
}

export default function SharePage() {
  const [posts, setPosts] = useState<SharePost[]>([]);
  const [sort, setSort] = useState<"latest" | "hot">("hot");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/share?sort=${sort}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Fetch posts error:", error);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getPersonalityEmoji = (type: string | null) => {
    if (!type) return "🎭";
    if (type.includes("毒舌")) return "🔥";
    if (type.includes("敏感")) return "💧";
    if (type.includes("冷淡")) return "🧊";
    return "🎭";
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 60) return "text-green-500";
    if (score >= 30) return "text-yellow-500";
    if (score >= 0) return "text-orange-500";
    if (score >= -30) return "text-red-400";
    return "text-red-600";
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 30) return `${diffDay}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-pink-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">翻车现场</h1>
          <div className="w-5" />
        </div>

        {/* 排序切换 */}
        <div className="flex px-4 gap-2 pb-3">
          <button
            onClick={() => setSort("hot")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              sort === "hot"
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            最热
          </button>
          <button
            onClick={() => setSort("latest")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              sort === "latest"
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            最新
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-8 h-8 animate-spin text-pink-400 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-400">加载中...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-4xl block mb-3">📭</span>
            <span className="text-sm">暂无分享，快去玩游戏分享你的翻车经历吧！</span>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/share/${post.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  {/* 左侧内容 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-800 mb-1.5 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{getPersonalityEmoji(post.personality_type)}</span>
                      <span className="text-xs text-gray-400">{post.author_name}</span>
                      {post.scenario_title && (
                        <>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs text-gray-400">{post.scenario_title}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {post.result_title && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          (post.final_score ?? 0) >= 30
                            ? "bg-green-50 text-green-600"
                            : (post.final_score ?? 0) >= 0
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-red-50 text-red-500"
                        }`}>
                          {post.result_title}
                        </span>
                      )}
                      <span className={`text-xs font-bold ${getScoreColor(post.final_score)}`}>
                        {post.final_score !== null ? `${post.final_score > 0 ? '+' : ''}${post.final_score}分` : ''}
                      </span>
                    </div>
                  </div>

                  {/* 右侧互动 */}
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">{post.like_count}</span>
                  </div>
                </div>

                {/* 底部时间 */}
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <span className="text-[11px] text-gray-300">{getTimeAgo(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

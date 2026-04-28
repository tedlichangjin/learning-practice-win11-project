"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Heart,
  Loader2,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";
import { getCommunityFallbackImage } from "@/lib/game/visual-assets";

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

  const getPersonalityLabel = (type: string | null) => {
    if (!type) return "随机人设";
    if (type.includes("毒舌")) return "嘴硬毒舌";
    if (type.includes("敏感")) return "委屈敏感";
    if (type.includes("冷淡")) return "冷淡克制";
    return type;
  };

  const getScoreTone = (score: number | null) => {
    if (score === null) return "bg-stone-100 text-stone-500";
    if (score >= 60) return "bg-emerald-50 text-emerald-700";
    if (score >= 30) return "bg-lime-50 text-lime-700";
    if (score >= 0) return "bg-amber-50 text-amber-700";
    return "bg-[#fff0f1] text-[#a83246]";
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 60) return `${Math.max(diffMin, 1)}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 30) return `${diffDay}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-[#ead8cf]/80 bg-[#fff8f3]/88 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
            aria-label="返回首页"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Flame className="h-4 w-4 text-[#a83246]" />
            翻车现场
          </div>
          <div className="h-9 w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 grid gap-5 rounded-[8px] border border-[#ead8cf] bg-white/72 p-5 shadow-sm backdrop-blur lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-bold text-[#a83246]">
              <MessageCircleHeart className="h-3.5 w-3.5" />
              玩家真实结局广场
            </div>
            <h1 className="text-3xl font-black tracking-tight text-stone-950">
              看看大家都怎么翻车
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              每条分享都来自一局对话结算，分数、场景和人设会一起保留。
            </p>
          </div>
          <div className="inline-flex rounded-[8px] border border-[#ead8cf] bg-[#fff8f3] p-1">
            <button
              type="button"
              onClick={() => setSort("hot")}
              className={`rounded-[7px] px-4 py-2 text-sm font-bold transition ${
                sort === "hot"
                  ? "bg-[#a83246] text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              最热
            </button>
            <button
              type="button"
              onClick={() => setSort("latest")}
              className={`rounded-[7px] px-4 py-2 text-sm font-bold transition ${
                sort === "latest"
                  ? "bg-[#a83246] text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              最新
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[8px] border border-[#ead8cf] bg-white/60">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#a83246]" />
            <span className="text-sm text-stone-500">加载中...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d9c6bb] bg-white/55 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-[#c85d6c]" />
            <p className="text-sm font-medium text-stone-600">
              暂无分享，快去玩游戏分享你的翻车经历吧。
            </p>
            <Link
              href="/"
              className="mt-5 rounded-[8px] bg-[#a83246] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#912b3d]"
            >
              去挑战一局
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const cover = post.cover_image_url || getCommunityFallbackImage(post.id);
              return (
                <Link
                  key={post.id}
                  href={`/share/${post.id}`}
                  className="group overflow-hidden rounded-[8px] border border-[#ead8cf] bg-white/82 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(91,42,48,0.12)]"
                >
                  <div className="relative h-44 bg-stone-100">
                    <Image
                      src={cover}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/88 px-2.5 py-1 text-xs font-bold text-[#a83246] backdrop-blur">
                        {getPersonalityLabel(post.personality_type)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur ${getScoreTone(post.final_score)}`}
                      >
                        {post.final_score !== null
                          ? `${post.final_score > 0 ? "+" : ""}${post.final_score} 分`
                          : "--"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-2 text-base font-black leading-snug text-stone-950">
                      {post.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">
                        {post.author_name}
                      </span>
                      {post.scenario_title && (
                        <>
                          <span className="text-stone-300">/</span>
                          <span>{post.scenario_title}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#f0e4dd] pt-3">
                      <span className="text-xs text-stone-400">
                        {getTimeAgo(post.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a83246]">
                        <Heart className="h-3.5 w-3.5" />
                        {post.like_count}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

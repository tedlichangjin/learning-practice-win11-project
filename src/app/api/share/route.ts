import { count, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/storage/database/db";
import { sharePosts } from "@/storage/database/shared/schema";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") === "hot" ? "hot" : "latest";
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const [posts, [totalRow]] = await Promise.all([
      db
        .select({
          id: sharePosts.id,
          title: sharePosts.title,
          author_name: sharePosts.author_name,
          personality_type: sharePosts.personality_type,
          scenario_title: sharePosts.scenario_title,
          final_score: sharePosts.final_score,
          result_title: sharePosts.result_title,
          like_count: sharePosts.like_count,
          cover_image_url: sharePosts.cover_image_url,
          created_at: sharePosts.created_at,
        })
        .from(sharePosts)
        .orderBy(
          sort === "hot"
            ? desc(sharePosts.like_count)
            : desc(sharePosts.created_at)
        )
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() }).from(sharePosts),
    ]);

    return NextResponse.json({
      posts,
      total: Number(totalRow?.total ?? 0),
      page,
      pageSize,
    });
  } catch (error) {
    console.error("List share posts error:", error);
    return NextResponse.json(
      { error: "获取分享列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const {
      title,
      content,
      cover_image_url,
      author_name,
      personality_type,
      scenario_title,
      final_score,
      result_title,
      share_text,
      chat_messages,
    } = body;

    const [post] = await db
      .insert(sharePosts)
      .values({
        title,
        content,
        cover_image_url,
        author_name: author_name || "匿名玩家",
        personality_type,
        scenario_title,
        final_score,
        result_title,
        share_text,
        chat_messages,
        like_count: 0,
      })
      .returning({ id: sharePosts.id });

    return NextResponse.json({ id: post?.id });
  } catch (error) {
    console.error("Create share post error:", error);
    return NextResponse.json(
      { error: "保存分享失败" },
      { status: 500 }
    );
  }
}

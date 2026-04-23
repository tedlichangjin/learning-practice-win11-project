import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取分享列表（支持分页和按热度/时间排序）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "latest"; // latest | hot
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 10;

    const query = client
      .from("share_posts")
      .select("id, title, author_name, personality_type, scenario_title, final_score, result_title, like_count, cover_image_url, created_at")
      .order(sort === "hot" ? "like_count" : "created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await query;
    if (error) throw new Error(`查询失败: ${error.message}`);

    // 获取总数
    const { count, error: countError } = await client
      .from("share_posts")
      .select("*", { count: "exact", head: true });
    if (countError) throw new Error(`计数失败: ${countError.message}`);

    return NextResponse.json({
      posts: data,
      total: count,
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

// 保存一条分享
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
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

    const { data, error } = await client
      .from("share_posts")
      .insert({
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
      .select("id")
      .single();

    if (error) throw new Error(`插入失败: ${error.message}`);

    return NextResponse.json({ id: data?.id });
  } catch (error) {
    console.error("Create share post error:", error);
    return NextResponse.json(
      { error: "保存分享失败" },
      { status: 500 }
    );
  }
}

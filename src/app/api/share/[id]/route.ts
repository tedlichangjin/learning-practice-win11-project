import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取单条分享详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("share_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!data) return NextResponse.json({ error: "分享不存在" }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get share post error:", error);
    return NextResponse.json(
      { error: "获取分享详情失败" },
      { status: 500 }
    );
  }
}

// 点赞
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // 先获取当前点赞数
    const { data: current, error: fetchError } = await client
      .from("share_posts")
      .select("like_count")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw new Error(`查询失败: ${fetchError.message}`);
    if (!current) return NextResponse.json({ error: "分享不存在" }, { status: 404 });

    const { data, error } = await client
      .from("share_posts")
      .update({ like_count: current.like_count + 1 })
      .eq("id", id)
      .select("like_count")
      .single();

    if (error) throw new Error(`更新失败: ${error.message}`);

    return NextResponse.json({ like_count: data?.like_count });
  } catch (error) {
    console.error("Like share post error:", error);
    return NextResponse.json(
      { error: "点赞失败" },
      { status: 500 }
    );
  }
}

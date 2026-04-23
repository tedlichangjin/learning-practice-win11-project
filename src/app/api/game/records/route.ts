import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

/** GET /api/game/records — 查询当前用户游戏记录（需登录） */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || "20")));

    const client = getSupabaseClient();

    // 查询总数
    const { count, error: countError } = await client
      .from("game_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Count game records error:", countError);
      return NextResponse.json(
        { error: "查询失败" },
        { status: 500 }
      );
    }

    // 查询分页数据
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: records, error } = await client
      .from("game_records")
      .select("id, scenario, final_score, result, played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Fetch game records error:", error);
      return NextResponse.json(
        { error: "查询失败" },
        { status: 500 }
      );
    }

    // 统计数据
    const { data: stats, error: statsError } = await client
      .from("game_records")
      .select("final_score, result")
      .eq("user_id", user.id);

    let totalGames = 0;
    let winCount = 0;
    let bestScore = -Infinity;

    if (!statsError && stats) {
      totalGames = stats.length;
      winCount = stats.filter((s: { result: string }) => s.result === "通关").length;
      bestScore = stats.reduce(
        (max: number, s: { final_score: number }) => Math.max(max, s.final_score),
        -Infinity
      );
      if (bestScore === -Infinity) bestScore = 0;
    }

    return NextResponse.json({
      records: records || [],
      total: count || 0,
      page,
      pageSize,
      stats: {
        totalGames,
        winCount,
        winRate: totalGames > 0 ? Math.round((winCount / totalGames) * 100) : 0,
        bestScore,
      },
    });
  } catch (error) {
    console.error("Get game records error:", error);
    return NextResponse.json(
      { error: "查询失败" },
      { status: 500 }
    );
  }
}

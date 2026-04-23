import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

/** POST /api/game/record — 保存游戏记录（需登录） */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "未登录，无法保存记录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { scenario, final_score, result } = body;

    if (typeof final_score !== "number" || !result) {
      return NextResponse.json(
        { error: "参数不完整" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from("game_records")
      .insert({
        user_id: user.id,
        scenario: scenario || null,
        final_score,
        result,
      })
      .select("id, scenario, final_score, result, played_at")
      .single();

    if (error || !data) {
      console.error("Insert game record error:", error);
      return NextResponse.json(
        { error: "保存记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ record: data });
  } catch (error) {
    console.error("Save game record error:", error);
    return NextResponse.json(
      { error: "保存记录失败" },
      { status: 500 }
    );
  }
}

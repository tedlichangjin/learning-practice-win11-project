import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

/**
 * GET /api/leaderboard — 排行榜，按最高好感度分数排名前 20 名
 * 所有人都能看，但只有登录用户的成绩才会上榜
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 查询每个用户的最高分，取前 20 名
    // 使用 Supabase RPC 或子查询：先按用户分组取最高分，再排序
    const { data: records, error } = await client
      .from("game_records")
      .select("user_id, final_score, played_at, users(username)")
      .order("final_score", { ascending: false });

    if (error) {
      console.error("Fetch leaderboard error:", error);
      return NextResponse.json(
        { error: "查询排行榜失败" },
        { status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ leaderboard: [], currentUserRank: null });
    }

    // 按用户分组，取每个用户的最高分
    const userBestMap = new Map<
      number,
      {
        userId: number;
        username: string;
        bestScore: number;
        achievedAt: string;
      }
    >();

    for (const record of records) {
      const userId = record.user_id;
      // Supabase join 返回的 users 字段可能是数组或对象
      const usersData = record.users as unknown;
      let username = "未知用户";
      if (Array.isArray(usersData) && usersData.length > 0) {
        username = (usersData[0] as { username?: string }).username || "未知用户";
      } else if (usersData && typeof usersData === "object" && !Array.isArray(usersData)) {
        username = (usersData as { username?: string }).username || "未知用户";
      }

      if (!userBestMap.has(userId) || record.final_score > (userBestMap.get(userId)?.bestScore ?? -Infinity)) {
        userBestMap.set(userId, {
          userId,
          username,
          bestScore: record.final_score,
          achievedAt: record.played_at,
        });
      }
    }

    // 排序取前 20
    const sorted = Array.from(userBestMap.values())
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 20);

    const leaderboard = sorted.map((item, index) => ({
      rank: index + 1,
      userId: item.userId,
      username: item.username,
      bestScore: item.bestScore,
      achievedAt: item.achievedAt,
    }));

    // 查询当前登录用户的排名
    let currentUserRank = null;
    const user = await getCurrentUserFromRequest(request);
    if (user) {
      const entry = leaderboard.find((e) => e.userId === user.id);
      if (entry) {
        currentUserRank = entry;
      } else {
        // 用户不在 top20 中，查其最高分和排名
        const userBest = userBestMap.get(user.id);
        if (userBest) {
          // 计算总排名
          const allSorted = Array.from(userBestMap.values()).sort(
            (a, b) => b.bestScore - a.bestScore
          );
          const rank = allSorted.findIndex((e) => e.userId === user.id) + 1;
          currentUserRank = {
            rank,
            userId: user.id,
            username: userBest.username,
            bestScore: userBest.bestScore,
            achievedAt: userBest.achievedAt,
          };
        }
      }
    }

    return NextResponse.json({ leaderboard, currentUserRank });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "查询排行榜失败" },
      { status: 500 }
    );
  }
}

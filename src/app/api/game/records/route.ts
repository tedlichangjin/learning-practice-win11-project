import { and, count, desc, eq, max } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { getDb } from "@/storage/database/db";
import { gameRecords } from "@/storage/database/shared/schema";

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
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize") || "20"))
    );
    const offset = (page - 1) * pageSize;

    const db = getDb();

    const [[totalRow], records, [winRow], [bestScoreRow]] = await Promise.all([
      db
        .select({ total: count() })
        .from(gameRecords)
        .where(eq(gameRecords.user_id, user.id)),
      db
        .select({
          id: gameRecords.id,
          scenario: gameRecords.scenario,
          final_score: gameRecords.final_score,
          result: gameRecords.result,
          played_at: gameRecords.played_at,
        })
        .from(gameRecords)
        .where(eq(gameRecords.user_id, user.id))
        .orderBy(desc(gameRecords.played_at))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(gameRecords)
        .where(and(eq(gameRecords.user_id, user.id), eq(gameRecords.result, "通关"))),
      db
        .select({ bestScore: max(gameRecords.final_score) })
        .from(gameRecords)
        .where(eq(gameRecords.user_id, user.id)),
    ]);

    const totalGames = Number(totalRow?.total ?? 0);
    const winCount = Number(winRow?.total ?? 0);
    const bestScore = Number(bestScoreRow?.bestScore ?? 0);

    return NextResponse.json({
      records,
      total: totalGames,
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

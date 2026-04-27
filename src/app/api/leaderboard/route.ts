import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { getDb } from "@/storage/database/db";
import { gameRecords, users } from "@/storage/database/shared/schema";

type LeaderboardEntry = {
  userId: number;
  username: string;
  bestScore: number;
  achievedAt: Date | null;
};

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const records = await db
      .select({
        userId: gameRecords.user_id,
        finalScore: gameRecords.final_score,
        playedAt: gameRecords.played_at,
        username: users.username,
      })
      .from(gameRecords)
      .innerJoin(users, eq(gameRecords.user_id, users.id))
      .orderBy(desc(gameRecords.final_score), desc(gameRecords.played_at));

    if (records.length === 0) {
      return NextResponse.json({ leaderboard: [], currentUserRank: null });
    }

    const userBestMap = new Map<number, LeaderboardEntry>();

    for (const record of records) {
      const currentBest = userBestMap.get(record.userId);
      if (!currentBest || record.finalScore > currentBest.bestScore) {
        userBestMap.set(record.userId, {
          userId: record.userId,
          username: record.username,
          bestScore: record.finalScore,
          achievedAt: record.playedAt,
        });
      }
    }

    const allSorted = Array.from(userBestMap.values()).sort(
      (a, b) => b.bestScore - a.bestScore
    );

    const leaderboard = allSorted.slice(0, 20).map((item, index) => ({
      rank: index + 1,
      userId: item.userId,
      username: item.username,
      bestScore: item.bestScore,
      achievedAt: item.achievedAt,
    }));

    let currentUserRank = null;
    const user = await getCurrentUserFromRequest(request);
    if (user) {
      const rankIndex = allSorted.findIndex((entry) => entry.userId === user.id);
      if (rankIndex >= 0) {
        const entry = allSorted[rankIndex];
        currentUserRank = {
          rank: rankIndex + 1,
          userId: entry.userId,
          username: entry.username,
          bestScore: entry.bestScore,
          achievedAt: entry.achievedAt,
        };
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

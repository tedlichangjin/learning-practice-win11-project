import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { getDb } from "@/storage/database/db";
import { gameRecords } from "@/storage/database/shared/schema";

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

    const db = getDb();
    const [record] = await db
      .insert(gameRecords)
      .values({
        user_id: user.id,
        scenario: scenario || null,
        final_score,
        result,
      })
      .returning({
        id: gameRecords.id,
        scenario: gameRecords.scenario,
        final_score: gameRecords.final_score,
        result: gameRecords.result,
        played_at: gameRecords.played_at,
      });

    if (!record) {
      console.error("Insert game record error: empty returning row");
      return NextResponse.json(
        { error: "保存记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Save game record error:", error);
    return NextResponse.json(
      { error: "保存记录失败" },
      { status: 500 }
    );
  }
}

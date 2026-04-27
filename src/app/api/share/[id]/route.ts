import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/storage/database/db";
import { sharePosts } from "@/storage/database/shared/schema";

function parsePostId(rawId: string): number | null {
  const postId = Number(rawId);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parsePostId(id);

    if (!postId) {
      return NextResponse.json({ error: "分享不存在" }, { status: 404 });
    }

    const db = getDb();
    const post = await db.query.sharePosts.findFirst({
      where: eq(sharePosts.id, postId),
    });

    if (!post) {
      return NextResponse.json({ error: "分享不存在" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Get share post error:", error);
    return NextResponse.json(
      { error: "获取分享详情失败" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parsePostId(id);

    if (!postId) {
      return NextResponse.json({ error: "分享不存在" }, { status: 404 });
    }

    const db = getDb();
    const [updatedPost] = await db
      .update(sharePosts)
      .set({
        like_count: sql`${sharePosts.like_count} + 1`,
      })
      .where(eq(sharePosts.id, postId))
      .returning({ like_count: sharePosts.like_count });

    if (!updatedPost) {
      return NextResponse.json({ error: "分享不存在" }, { status: 404 });
    }

    return NextResponse.json({ like_count: updatedPost.like_count });
  } catch (error) {
    console.error("Like share post error:", error);
    return NextResponse.json(
      { error: "点赞失败" },
      { status: 500 }
    );
  }
}

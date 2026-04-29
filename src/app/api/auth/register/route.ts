import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { generateToken, setAuthCookieOnResponse } from "@/lib/auth/session";
import { getRequestIp, verifyTurnstileToken } from "@/lib/auth/turnstile";
import { getDb } from "@/storage/database/db";
import { users } from "@/storage/database/shared/schema";

export async function POST(request: NextRequest) {
  try {
    const { username, password, turnstileToken } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { error: "用户名长度需在 2-50 个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度不能少于 6 个字符" },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstileToken(
      turnstileToken,
      getRequestIp(request)
    );
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "人机验证失败，请重新验证" },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.username, username),
    });

    if (existing) {
      return NextResponse.json(
        { error: "用户名已被占用" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ username, password: hashedPassword })
      .returning({
        id: users.id,
        username: users.username,
      });

    if (!newUser) {
      console.error("Insert user error: empty returning row");
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
    }

    const token = generateToken(newUser.id, newUser.username);
    const response = NextResponse.json({
      user: { id: newUser.id, username: newUser.username },
      token,
    });

    setAuthCookieOnResponse(response, newUser.id, newUser.username);
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "注册失败，请重试" },
      { status: 500 }
    );
  }
}

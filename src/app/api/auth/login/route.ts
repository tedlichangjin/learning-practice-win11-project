import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/password";
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
    const user = await db.query.users.findFirst({
      columns: { id: true, username: true, password: true },
      where: eq(users.username, username),
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.username);
    const response = NextResponse.json({
      user: { id: user.id, username: user.username },
      token,
    });

    setAuthCookieOnResponse(response, user.id, user.username);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    );
  }
}

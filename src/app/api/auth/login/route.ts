import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyPassword } from "@/lib/auth/password";
import { generateToken, setAuthCookieOnResponse } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查找用户
    const { data: user, error: fetchError } = await client
      .from("users")
      .select("id, username, password")
      .eq("username", username)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch user error:", fetchError);
      return NextResponse.json(
        { error: "登录失败，请重试" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 校验密码
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成 token
    const token = generateToken(user.id, user.username);

    // 构建响应，在响应体中返回 token（供 localStorage 存储）
    const response = NextResponse.json({
      user: { id: user.id, username: user.username },
      token,
    });

    // 同时也在 response 上设置 cookie（兜底）
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

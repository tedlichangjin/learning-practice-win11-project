import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { hashPassword } from "@/lib/auth/password";
import { generateToken, setAuthCookieOnResponse } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 参数校验
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

    const client = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existing, error: checkError } = await client
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      console.error("Check user error:", checkError);
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "用户名已被占用" },
        { status: 409 }
      );
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 插入用户
    const { data: newUser, error: insertError } = await client
      .from("users")
      .insert({ username, password: hashedPassword })
      .select("id, username")
      .single();

    if (insertError || !newUser) {
      console.error("Insert user error:", insertError);
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
    }

    // 生成 token
    const token = generateToken(newUser.id, newUser.username);

    // 构建响应，在响应体中返回 token（供 localStorage 存储）
    const response = NextResponse.json({
      user: { id: newUser.id, username: newUser.username },
      token,
    });

    // 同时也在 response 上设置 cookie（兜底）
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

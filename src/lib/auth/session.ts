import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "auth_token";
const AUTH_HEADER = "authorization";

// 简易 token 生成（基于用户 ID + 用户名 + 时间戳 + 随机数的 base64 编码）
function encodeToken(userId: number, username: string): string {
  const payload = JSON.stringify({
    uid: userId,
    name: username,
    ts: Date.now(),
    rand: Math.floor(Math.random() * 100000),
  });
  return Buffer.from(payload).toString("base64url");
}

function decodeToken(token: string): { uid: number; name: string } | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );
    if (payload.uid && payload.name) {
      return { uid: payload.uid, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 天
  path: "/",
};

/** 生成认证 token */
export function generateToken(userId: number, username: string): string {
  return encodeToken(userId, username);
}

/** 在 NextResponse 上设置登录 cookie（兜底方式） */
export function setAuthCookieOnResponse(
  response: NextResponse,
  userId: number,
  username: string
): void {
  const token = encodeToken(userId, username);
  response.cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

/** 在 NextResponse 上清除登录 cookie */
export function clearAuthCookieOnResponse(response: NextResponse): void {
  response.cookies.set(TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

/** 获取当前登录用户，支持两种方式：Authorization header 优先，Cookie 兜底 */
export async function getCurrentUser(): Promise<{
  id: number;
  username: string;
} | null> {
  // 方式 1: 从 Authorization header 读取（localStorage 方案）
  // 注意：此处无法直接读取 request header，由各 route 手动传入
  // 所以这里只作为 cookie 兜底

  // 方式 2: 从 Cookie 读取
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return { id: decoded.uid, username: decoded.name };
}

/** 从 Authorization header 中解析用户（在 route handler 中调用） */
export function getUserFromAuthHeader(
  authHeader: string | null
): { id: number; username: string } | null {
  if (!authHeader) return null;
  // 支持 "Bearer <token>" 和纯 token 两种格式
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return { id: decoded.uid, username: decoded.name };
}

/** 综合获取当前用户：优先 Authorization header，其次 Cookie */
export async function getCurrentUserFromRequest(request: Request): Promise<{
  id: number;
  username: string;
} | null> {
  // 优先从 Authorization header 读取
  const authHeader = request.headers.get(AUTH_HEADER);
  const userFromHeader = getUserFromAuthHeader(authHeader);
  if (userFromHeader) return userFromHeader;

  // 兜底从 Cookie 读取
  return getCurrentUser();
}

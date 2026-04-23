import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest, clearAuthCookieOnResponse } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    clearAuthCookieOnResponse(response);
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "退出失败" },
      { status: 500 }
    );
  }
}

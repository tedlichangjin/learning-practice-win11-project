import { NextRequest, NextResponse } from "next/server";
import { synthesize } from "@/lib/volcengine/tts";
import { getPersonalityById } from "@/lib/game/personalities";
import type { TTSRequestBody } from "@/lib/game/types";

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequestBody = await request.json();
    const { text, personalityId } = body;

    const personality = getPersonalityById(personalityId);

    const result = await synthesize({
      text,
      uid: `game-${Date.now()}`,
      voiceType: personality.ttsSpeaker,
    });

    // 返回 data URL 格式的音频
    const audioUrl = `data:${result.mimeType};base64,${result.audioBase64}`;

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "语音生成失败" },
      { status: 500 }
    );
  }
}

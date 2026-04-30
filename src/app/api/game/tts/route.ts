import { NextRequest, NextResponse } from "next/server";

import { getPersonalityById } from "@/lib/game/personalities";
import type { TTSRequestBody } from "@/lib/game/types";
import { R2ConfigurationError, uploadBufferToR2 } from "@/lib/storage/r2";
import { synthesize } from "@/lib/volcengine/tts";

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

    const upload = await uploadBufferToR2({
      buffer: Buffer.from(result.audioBase64, "base64"),
      contentType: result.mimeType,
      extension: "mp3",
      prefix: "game/audio",
    });

    return NextResponse.json({ audioUrl: upload.url });
  } catch (error) {
    console.error("TTS error:", error);
    if (error instanceof R2ConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "语音生成失败" }, { status: 500 });
  }
}

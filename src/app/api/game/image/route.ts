import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/volcengine/image";
import { getPersonalityById } from "@/lib/game/personalities";
import type { ImageRequestBody } from "@/lib/game/types";
import { R2ConfigurationError, uploadBufferToR2 } from "@/lib/storage/r2";

function base64ToBuffer(value: string): Buffer {
  const base64 = value.includes(",") ? value.split(",").pop() : value;
  return Buffer.from(base64 ?? "", "base64");
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequestBody = await request.json();
    const { personalityId, mood, context } = body;

    const personality = getPersonalityById(personalityId);

    // 根据情绪调整图片 prompt
    const moodDescriptions: Record<string, string> = {
      生气: "angry expression, furrowed brows",
      委屈: "sad pouty expression, teary eyes",
      冷淡: "cold indifferent expression, looking away",
      不爽: "annoyed expression, rolling eyes",
      阴阳怪气: "sarcastic smirk, raised eyebrow",
      松动: "slight smile, softening expression",
      无语: "speechless expression, face palm",
      开心: "happy smile, bright eyes",
    };

    const moodDetail = moodDescriptions[mood] || "neutral expression";
    const prompt = `${personality.imagePrompt}, ${moodDetail}, mood: ${mood}, context: ${context.substring(0, 50)}`;

    const result = await generate({
      prompt,
      size: "1024x1024",
      responseFormat: "b64_json",
    });

    if (result.b64Json) {
      const imageBuffer = base64ToBuffer(result.b64Json);
      const upload = await uploadBufferToR2({
        buffer: imageBuffer,
        contentType: "image/png",
        extension: "png",
        prefix: "game/images",
      });

      return NextResponse.json({ imageUrl: upload.url });
    }

    return NextResponse.json(
      { error: "图片生成失败" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    if (error instanceof R2ConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "图片生成失败" },
      { status: 500 }
    );
  }
}

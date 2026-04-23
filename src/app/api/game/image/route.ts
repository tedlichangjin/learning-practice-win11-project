import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/volcengine/image";
import { getPersonalityById } from "@/lib/game/personalities";
import type { ImageRequestBody } from "@/lib/game/types";

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
      responseFormat: "url",
    });

    if (result.url) {
      return NextResponse.json({ imageUrl: result.url });
    }

    return NextResponse.json(
      { error: "图片生成失败" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "图片生成失败" },
      { status: 500 }
    );
  }
}

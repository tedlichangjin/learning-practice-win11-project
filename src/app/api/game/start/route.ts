import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/volcengine/llm";
import { scenarios } from "@/lib/game/scenarios";
import { getRandomPersonality } from "@/lib/game/personalities";
import { buildStartSystemPrompt } from "@/lib/game/prompts";
import type { AIResponse, ChatMessage, ReplyOption } from "@/lib/game/types";

export async function POST(request: NextRequest) {
  try {
    // 随机选择场景和人设
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const personality = getRandomPersonality();

    const systemPrompt = buildStartSystemPrompt(personality.id, scenario.id);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: "请生成开场消息和5个回复选项。",
      },
    ];

    const content = await chat(messages, { temperature: 0.9 });

    // 解析 JSON 响应
    let aiResponse: AIResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);
      aiResponse = {
        text: parsed.text || "...",
        mood: parsed.mood || "生气",
        options: (parsed.options || []).map(
          (opt: { id?: string; text: string }, i: number) => ({
            id: opt.id || String(i + 1),
            text: opt.text,
          })
        ),
        scoreChange: 0,
        shouldEnd: false,
      };

      // 确保有5个选项
      while (aiResponse.options.length < 5) {
        aiResponse.options.push({
          id: String(aiResponse.options.length + 1),
          text: "...",
        });
      }
    } catch {
      aiResponse = {
        text: content.substring(0, 60),
        mood: "生气",
        options: [
          { id: "1", text: "对不起我错了" },
          { id: "2", text: "别生气了嘛" },
          { id: "3", text: "我刚才在忙" },
          { id: "4", text: "发个搞笑表情包" },
          { id: "5", text: "你又怎么了" },
        ],
        scoreChange: 0,
        shouldEnd: false,
      };
    }

    const firstMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "partner",
      text: aiResponse.text,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      scenario,
      personality: {
        id: personality.id,
        name: personality.name,
        description: personality.description,
      },
      firstMessage,
      options: aiResponse.options.slice(0, 5),
      mood: aiResponse.mood,
    });
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "开局生成失败，请重试" },
      { status: 500 }
    );
  }
}

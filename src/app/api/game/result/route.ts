import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/volcengine/llm";
import { buildResultSystemPrompt } from "@/lib/game/prompts";
import type { ResultRequestBody, GameResult } from "@/lib/game/types";

export async function POST(request: NextRequest) {
  try {
    const body: ResultRequestBody = await request.json();
    const { totalScore, roundCount, personalityId, scenarioId, lastMood } = body;

    const systemPrompt = buildResultSystemPrompt(
      personalityId,
      totalScore,
      roundCount,
      scenarioId,
      lastMood
    );

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: "请生成游戏结果。",
      },
    ];

    const content = await chat(messages, { temperature: 1.0 });

    let result: GameResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);
      result = {
        finalScore: totalScore,
        title: parsed.title || "结局未知",
        description:
          parsed.description || "这场对话走向了一个意想不到的方向。",
        shareText:
          parsed.shareText || "我刚刚玩了一个哄对象的游戏，结果离谱了！",
        personalityName: personalityId,
      };
    } catch {
      // Fallback 结果
      let title = "结局未知";
      let description = "这场对话走向了一个意想不到的方向。";
      let shareText = "我刚刚玩了一个哄对象的游戏，结果离谱了！";

      if (totalScore >= 60) {
        title = "居然真哄回来了";
        description = "你的情商在这个场景里意外地在线，对方虽然嘴上不饶人，但心里已经软了。";
        shareText = "我居然靠三言两语把生气的对象哄好了，请叫我情商天花板！";
      } else if (totalScore >= 30) {
        title = "表面和平";
        description = "你勉强维持了表面的和平，但对方的小本本上又记了一笔。";
        shareText = "我靠硬拗撑到了表面和平，但她的小本本已经写满了！";
      } else if (totalScore >= 0) {
        title = "聊了个寂寞";
        description = "聊了半天也没聊出个所以然来，对方的心情比聊天前还复杂了。";
        shareText = "我花了5轮对话，成功把她的心情从生气聊成了更生气！";
      } else if (totalScore >= -30) {
        title = "越聊越气";
        description = "你完美演示了什么叫火上浇油，对方的怒气值一路飙升。";
        shareText = "我全程踩雷，她从生气聊到了怀疑我智商！";
      } else {
        title = "彻底翻车";
        description = "你的回复已经把对方逼到了极限，结局是惨烈的。";
        shareText = "我成功在3轮内让对方把我拉黑了，新纪录！";
      }

      result = {
        finalScore: totalScore,
        title,
        description,
        shareText,
        personalityName: personalityId,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Result error:", error);
    return NextResponse.json(
      { error: "结果生成失败" },
      { status: 500 }
    );
  }
}

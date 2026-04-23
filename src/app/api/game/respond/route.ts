import { NextRequest } from "next/server";
import { chatStream } from "@/lib/volcengine/llm";
import { buildRespondSystemPrompt } from "@/lib/game/prompts";
import type { RespondRequestBody, AIResponse, ReplyOption } from "@/lib/game/types";

export async function POST(request: NextRequest) {
  try {
    const body: RespondRequestBody = await request.json();
    const { message, history, scenarioId, personalityId, currentScore, round } = body;

    const maxRounds = 5;
    const systemPrompt = buildRespondSystemPrompt(
      personalityId,
      scenarioId,
      currentScore,
      round,
      maxRounds
    );

    // 构建对话历史
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // 添加历史消息（最近6条，避免token过多）
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "partner" ? "assistant" : "user",
        content: msg.text,
      });
    }

    // 添加当前用户消息
    messages.push({ role: "user", content: message });

    // 使用流式输出
    const stream = chatStream(messages, { temperature: 0.9 });

    // 创建 SSE 流
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = "";

        try {
          for await (const text of stream) {
            fullContent += text;
            // 流式发送文本块
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", content: text })}\n\n`
              )
            );
          }

          // 流结束，解析完整 JSON
          let aiResponse: AIResponse;
          try {
            const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found");
            const parsed = JSON.parse(jsonMatch[0]);

            const options: ReplyOption[] = (parsed.options || []).map(
              (opt: { id?: string; text: string }, i: number) => ({
                id: opt.id || String(i + 1),
                text: opt.text,
              })
            );

            // 确保有5个选项
            while (options.length < 5) {
              options.push({
                id: String(options.length + 1),
                text: "...",
              });
            }

            aiResponse = {
              text: parsed.text || "...",
              mood: parsed.mood || "生气",
              options: options.slice(0, 5),
              scoreChange: Math.max(-30, Math.min(30, Number(parsed.scoreChange) || 0)),
              shouldEnd: Boolean(parsed.shouldEnd),
              endReason: parsed.endReason || "",
            };
          } catch {
            aiResponse = {
              text: fullContent.substring(0, 60) || "...",
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

          // 发送完整的结构化数据
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", data: aiResponse })}\n\n`
            )
          );
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "生成失败" })}\n\n`
            )
          );
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Respond error:", error);
    return new Response(JSON.stringify({ error: "回复生成失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

"use client";

import { useState, useCallback, useRef } from "react";
import type {
  GameState,
  ChatMessage,
  ReplyOption,
  PersonalityId,
  GameResult,
  AIResponse,
} from "@/lib/game/types";

const MAX_ROUNDS = 5;

const initialState: GameState = {
  phase: "idle",
  scenario: null,
  personality: null,
  messages: [],
  currentOptions: [],
  currentScore: 30, // 开局分数偏低（对方生气状态）
  round: 0,
  maxRounds: MAX_ROUNDS,
  isPartnerTyping: false,
  isGeneratingVoice: false,
  isGeneratingImage: false,
  result: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  /** 开始新游戏 */
  const startGame = useCallback(async () => {
    setState((prev) => ({ ...prev, phase: "playing", isPartnerTyping: true, messages: [], currentOptions: [], currentScore: 30, round: 0, result: null }));

    try {
      const res = await fetch("/api/game/start", { method: "POST" });
      if (!res.ok) throw new Error("Start failed");
      const data = await res.json();

      const firstMessage: ChatMessage = {
        ...data.firstMessage,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        scenario: data.scenario,
        personality: data.personality,
        messages: [firstMessage],
        currentOptions: data.options,
        isPartnerTyping: false,
      }));

      // 异步生成语音
      generateVoice(data.personality.id, firstMessage.text, firstMessage.id);

      // 随机决定是否生成图片（40%概率）
      if (Math.random() < 0.4) {
        generateImage(data.personality.id, data.mood || "生气", firstMessage.id);
      }
    } catch (error) {
      console.error("Start game error:", error);
      setState((prev) => ({ ...prev, phase: "idle", isPartnerTyping: false }));
    }
  }, []);

  /** 发送用户回复 */
  const sendReply = useCallback(
    async (messageText: string) => {
      if (state.phase !== "playing" || state.isPartnerTyping) return;

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        text: messageText,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        currentOptions: [],
        isPartnerTyping: true,
      }));

      // 取消之前的请求
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        // 构建历史
        const history = state.messages.map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch("/api/game/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            history,
            scenarioId: state.scenario?.id,
            personalityId: state.personality?.id,
            currentScore: state.currentScore,
            round: state.round,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Respond failed");

        // 读取 SSE 流
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let streamingText = "";
        let aiData: AIResponse | null = null;

        // 不在这里创建 partner 消息，等 complete 事件后再添加
        // 避免在聊天气泡中显示原始 JSON

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === "text") {
                streamingText += event.content;
                // 不更新聊天气泡文字，因为流式输出是 JSON 格式
              } else if (event.type === "complete") {
                aiData = event.data;
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }

        if (aiData) {
          const newScore = Math.max(
            -100,
            Math.min(100, state.currentScore + aiData.scoreChange)
          );
          const newRound = state.round + 1;
          const shouldEnd =
            aiData.shouldEnd || newRound >= MAX_ROUNDS || newScore <= -70;

          const partnerMsgId = `msg-${Date.now()}-partner`;
          const partnerMessage: ChatMessage = {
            id: partnerMsgId,
            role: "partner",
            text: aiData.text,
            timestamp: Date.now(),
          };

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, partnerMessage],
            currentOptions: shouldEnd ? [] : aiData!.options,
            currentScore: newScore,
            round: newRound,
            isPartnerTyping: false,
            phase: shouldEnd ? "ended" : "playing",
          }));

          // 异步生成语音
          generateVoice(
            state.personality?.id as PersonalityId,
            aiData.text,
            partnerMsgId
          );

          // 随机生成图片（30%概率，不在最后一轮）
          if (!shouldEnd && Math.random() < 0.3) {
            generateImage(
              state.personality?.id as PersonalityId,
              aiData.mood,
              partnerMsgId
            );
          }

          // 如果游戏结束，生成结果
          if (shouldEnd) {
            generateResult(newScore, newRound, aiData.mood);
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Respond error:", error);
        setState((prev) => ({ ...prev, isPartnerTyping: false }));
      }
    },
    [state]
  );

  /** 生成语音 */
  const generateVoice = useCallback(
    async (personalityId: PersonalityId, text: string, messageId: string) => {
      setState((prev) => ({ ...prev, isGeneratingVoice: true }));
      try {
        const res = await fetch("/api/game/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, personalityId }),
        });
        if (!res.ok) return;
        const data = await res.json();

        setState((prev) => {
          const msgs = prev.messages.map((m) =>
            m.id === messageId ? { ...m, audioUrl: data.audioUrl } : m
          );
          return { ...prev, messages: msgs, isGeneratingVoice: false };
        });
      } catch {
        setState((prev) => ({ ...prev, isGeneratingVoice: false }));
      }
    },
    []
  );

  /** 生成自拍图 */
  const generateImage = useCallback(
    async (personalityId: PersonalityId, mood: string, messageId: string) => {
      setState((prev) => ({ ...prev, isGeneratingImage: true }));
      try {
        const res = await fetch("/api/game/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personalityId,
            mood,
            context: state.scenario?.title || "",
          }),
        });
        if (!res.ok) return;
        const data = await res.json();

        setState((prev) => {
          const msgs = prev.messages.map((m) =>
            m.id === messageId ? { ...m, imageUrl: data.imageUrl } : m
          );
          return { ...prev, messages: msgs, isGeneratingImage: false };
        });
      } catch {
        setState((prev) => ({ ...prev, isGeneratingImage: false }));
      }
    },
    [state.scenario]
  );

  /** 生成游戏结果 */
  const generateResult = useCallback(
    async (totalScore: number, roundCount: number, lastMood: string) => {
      try {
        const res = await fetch("/api/game/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalScore,
            roundCount,
            personalityId: state.personality?.id,
            scenarioId: state.scenario?.id,
            lastMood,
          }),
        });
        if (!res.ok) return;
        const result: GameResult = await res.json();

        setState((prev) => ({ ...prev, result }));
      } catch (error) {
        console.error("Result error:", error);
      }
    },
    [state.personality, state.scenario]
  );

  /** 重新开始 */
  const resetGame = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState(initialState);
  }, []);

  return {
    state,
    startGame,
    sendReply,
    resetGame,
  };
}

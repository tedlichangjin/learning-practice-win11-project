"use client";

import { useEffect, useRef } from "react";
import type { GameState } from "@/lib/game/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { OptionSelector } from "./OptionSelector";
import { ScoreBar } from "./ScoreBar";
import { ResultPage } from "./ResultPage";

interface ChatInterfaceProps {
  state: GameState;
  sendReply: (text: string) => void;
  resetGame: () => void;
}

export function ChatInterface({ state, sendReply, resetGame }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isPartnerTyping]);

  if (state.phase === "idle") return null;

  if (state.phase === "ended" && state.result) {
    return (
      <ResultPage
        result={state.result}
        messages={state.messages}
        personalityName={state.personality?.name || "她"}
        personalityType={state.personality?.name || undefined}
        scenarioTitle={state.scenario?.title || undefined}
        onRestart={resetGame}
      />
    );
  }

  const personalityName = state.personality?.name === "嘴硬毒舌型"
    ? "毒舌小公主"
    : state.personality?.name === "委屈敏感型"
    ? "敏感小可爱"
    : "冰山美人";

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      {/* 顶部导航 */}
      <div className="bg-[#EDEDED] border-b border-gray-300">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={resetGame}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-800">
              {personalityName}
            </div>
            <div className="text-[10px] text-gray-400">
              {state.scenario?.title || ""}
            </div>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* 分数条 */}
      <ScoreBar
        score={state.currentScore}
        round={state.round}
        maxRounds={state.maxRounds}
      />

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {state.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isGeneratingVoice={state.isGeneratingVoice}
            isGeneratingImage={state.isGeneratingImage}
            personalityName={personalityName}
          />
        ))}
        <TypingIndicator visible={state.isPartnerTyping} />
        <div ref={messagesEndRef} />
      </div>

      {/* 选项区域 */}
      <OptionSelector
        options={state.currentOptions}
        onSelect={sendReply}
        disabled={state.isPartnerTyping}
      />
    </div>
  );
}

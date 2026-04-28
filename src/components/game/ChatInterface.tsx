"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, MessageCircleHeart, Sparkles } from "lucide-react";
import type { GameState } from "@/lib/game/types";
import { CHAT_SLIDER_IMAGES, getPersonaImageByName } from "@/lib/game/visual-assets";
import { ImageSlider } from "./ImageSlider";
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

export function ChatInterface({
  state,
  sendReply,
  resetGame,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const personalityName =
    state.personality?.name === "嘴硬毒舌型"
      ? "毒舌小公主"
      : state.personality?.name === "委屈敏感型"
        ? "敏感小可爱"
        : "冰山美人";
  const personaImage = getPersonaImageByName(state.personality?.name);

  return (
    <div className="h-screen overflow-hidden bg-[#fff8f3] text-stone-900 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)]">
      <main className="flex h-screen min-w-0 flex-col border-[#ead8cf] bg-[#f2ebe4] lg:border-r">
        <header className="flex-shrink-0 border-b border-[#ded1c7] bg-[#fff8f3]/92 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={resetGame}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-white hover:text-[#a83246]"
              aria-label="返回开始页"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 text-center">
              <div className="truncate text-sm font-bold text-stone-900">
                {personalityName}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-stone-500">
                {state.scenario?.title || "随机情绪危机"}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a83246] text-white">
              <MessageCircleHeart className="h-4 w-4" />
            </div>
          </div>
        </header>

        <ScoreBar
          score={state.currentScore}
          round={state.round}
          maxRounds={state.maxRounds}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
          <div className="mx-auto max-w-2xl">
            {state.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isGeneratingVoice={state.isGeneratingVoice}
                isGeneratingImage={state.isGeneratingImage}
                personalityName={personalityName}
                personaImage={personaImage}
              />
            ))}
            <TypingIndicator
              visible={state.isPartnerTyping}
              personalityName={personalityName}
              personaImage={personaImage}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>

        <OptionSelector
          options={state.currentOptions}
          onSelect={sendReply}
          disabled={state.isPartnerTyping}
        />
      </main>

      <aside className="hidden h-screen min-w-0 bg-[#fff8f3] p-4 lg:block">
        <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-4">
          <div className="relative overflow-hidden rounded-[8px] border border-white shadow-[0_24px_90px_rgba(91,42,48,0.18)]">
            <ImageSlider
              images={[personaImage, ...CHAT_SLIDER_IMAGES]}
              interval={4300}
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/86 px-3 py-1.5 text-xs font-semibold text-[#8b3b45] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              人设自拍墙
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-[8px] bg-white/88 p-4 shadow-sm backdrop-blur">
              <div className="text-xs font-semibold text-[#a83246]">
                当前场景
              </div>
              <div className="mt-1 text-lg font-bold text-stone-950">
                {state.scenario?.title || "随机冲突"}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                回复越具体，越可能让气氛缓下来；敷衍会直接扣分。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["轮次", `${state.round}/${state.maxRounds}`],
              ["好感", `${state.currentScore > 0 ? "+" : ""}${state.currentScore}`],
              ["状态", state.isPartnerTyping ? "输入中" : "等待回复"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[8px] border border-[#ead8cf] bg-white/72 p-4"
              >
                <div className="text-xs text-stone-500">{label}</div>
                <div className="mt-1 truncate text-sm font-bold text-stone-900">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

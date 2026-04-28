"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { ChatMessage } from "@/lib/game/types";
import { VoiceMessage } from "./VoiceMessage";

interface MessageBubbleProps {
  message: ChatMessage;
  isGeneratingVoice: boolean;
  isGeneratingImage: boolean;
  personalityName: string;
  personaImage?: string;
}

export function MessageBubble({
  message,
  isGeneratingVoice,
  isGeneratingImage,
  personalityName,
  personaImage,
}: MessageBubbleProps) {
  const isPartner = message.role === "partner";

  return (
    <div
      className={`mb-4 flex gap-2.5 ${
        isPartner ? "justify-start" : "justify-end"
      }`}
    >
      {isPartner && (
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#a83246] shadow-sm">
          {personaImage ? (
            <Image
              src={personaImage}
              alt={`${personalityName}头像`}
              fill
              sizes="40px"
              className="object-cover object-top"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
              {personalityName.charAt(0)}
            </span>
          )}
        </div>
      )}

      <div
        className={`flex max-w-[78%] flex-col ${
          isPartner ? "items-start" : "items-end"
        }`}
      >
        {message.imageUrl && (
          <div className="mb-2 overflow-hidden rounded-[8px] border border-white bg-white shadow-[0_10px_30px_rgba(91,42,48,0.16)]">
            <Image
              src={message.imageUrl}
              alt="自拍"
              width={220}
              height={286}
              className="h-auto max-h-[320px] w-[220px] object-cover"
              unoptimized
            />
          </div>
        )}

        {!message.imageUrl && isGeneratingImage && isPartner && (
          <div className="mb-2 flex h-[156px] w-[220px] items-center justify-center rounded-[8px] border border-[#ead8cf] bg-white/70 shadow-sm">
            <div className="flex flex-col items-center gap-2 text-stone-400">
              <ImageIcon className="h-6 w-6 animate-pulse" />
              <span className="text-xs">自拍生成中...</span>
            </div>
          </div>
        )}

        {isPartner && (
          <div className="mb-1.5">
            <VoiceMessage
              audioUrl={message.audioUrl}
              isGenerating={isGeneratingVoice && !message.audioUrl}
            />
          </div>
        )}

        {message.text && (
          <div
            className={`rounded-[8px] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
              isPartner
                ? "border border-[#ead8cf]/80 bg-white text-stone-800"
                : "bg-[#95EC69] text-stone-900 shadow-[#95EC69]/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <span className="mt-1 text-[10px] text-stone-400">
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {!isPartner && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white shadow-sm">
          我
        </div>
      )}
    </div>
  );
}

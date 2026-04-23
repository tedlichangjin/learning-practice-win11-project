"use client";

import type { ChatMessage } from "@/lib/game/types";
import { VoiceMessage } from "./VoiceMessage";
import Image from "next/image";

interface MessageBubbleProps {
  message: ChatMessage;
  isGeneratingVoice: boolean;
  isGeneratingImage: boolean;
  personalityName: string;
}

export function MessageBubble({
  message,
  isGeneratingVoice,
  isGeneratingImage,
  personalityName,
}: MessageBubbleProps) {
  const isPartner = message.role === "partner";

  return (
    <div
      className={`flex gap-2 mb-3 ${isPartner ? "justify-start" : "justify-end"}`}
    >
      {/* 对方头像 */}
      {isPartner && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
          {personalityName.charAt(0)}
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col ${isPartner ? "items-start" : "items-end"}`}>
        {/* 图片消息 */}
        {message.imageUrl && (
          <div className="mb-1 rounded-lg overflow-hidden shadow-sm">
            <Image
              src={message.imageUrl}
              alt="自拍"
              width={200}
              height={260}
              className="object-cover rounded-lg"
              unoptimized
            />
          </div>
        )}

        {/* 图片加载中 */}
        {!message.imageUrl && isGeneratingImage && isPartner && (
          <div className="mb-1 rounded-lg bg-gray-100 flex items-center justify-center w-[200px] h-[160px]">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">自拍加载中...</span>
            </div>
          </div>
        )}

        {/* 语音消息 */}
        {isPartner && (
          <div className="mb-1">
            <VoiceMessage
              audioUrl={message.audioUrl}
              isGenerating={isGeneratingVoice && !message.audioUrl}
            />
          </div>
        )}

        {/* 文字气泡 */}
        {message.text && (
          <div
            className={`rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${
              isPartner
                ? "bg-white text-gray-800"
                : "bg-[#95EC69] text-gray-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 时间戳 */}
        <span className="text-[10px] text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* 用户头像 */}
      {!isPartner && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
          我
        </div>
      )}
    </div>
  );
}

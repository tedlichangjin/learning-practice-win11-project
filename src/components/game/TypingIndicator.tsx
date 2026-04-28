"use client";

import Image from "next/image";

interface TypingIndicatorProps {
  visible: boolean;
  personalityName?: string;
  personaImage?: string;
}

export function TypingIndicator({
  visible,
  personalityName = "她",
  personaImage,
}: TypingIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="mb-4 flex justify-start gap-2.5">
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
      <div className="rounded-[8px] border border-[#ead8cf]/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">对方正在输入</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#a83246] animate-bounce" />
            <div
              className="h-1.5 w-1.5 rounded-full bg-[#a83246] animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-1.5 w-1.5 rounded-full bg-[#a83246] animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PenLine, Send, X } from "lucide-react";
import type { ReplyOption } from "@/lib/game/types";

interface OptionSelectorProps {
  options: ReplyOption[];
  onSelect: (text: string) => void;
  disabled: boolean;
}

export function OptionSelector({
  options,
  onSelect,
  disabled,
}: OptionSelectorProps) {
  const [customText, setCustomText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleCustomSend = () => {
    if (!customText.trim()) return;
    onSelect(customText.trim());
    setCustomText("");
    setShowInput(false);
  };

  return (
    <div className="flex-shrink-0 border-t border-[#ded1c7] bg-[#fff8f3]/95 p-3 backdrop-blur sm:p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 grid gap-2">
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.text)}
              disabled={disabled}
              className={`group flex w-full items-start gap-3 rounded-[8px] border px-3.5 py-2.5 text-left text-sm leading-6 transition active:scale-[0.99] ${
                disabled
                  ? "cursor-not-allowed border-[#ead8cf] bg-stone-100 text-stone-400"
                  : "border-[#ead8cf] bg-white/86 text-stone-700 shadow-sm hover:border-[#c85d6c] hover:bg-white hover:text-stone-950"
              }`}
            >
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#f8e4df] text-[11px] font-bold text-[#a83246] group-hover:bg-[#a83246] group-hover:text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 break-words">{option.text}</span>
            </button>
          ))}
        </div>

        {!showInput ? (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            disabled={disabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#d9c6bb] bg-white/55 px-4 py-2.5 text-sm font-medium text-stone-500 transition hover:border-[#c85d6c] hover:bg-white hover:text-[#a83246] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PenLine className="h-4 w-4" />
            自己说一句
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustomSend();
              }}
              placeholder="输入你想说的话..."
              className="min-w-0 flex-1 rounded-[8px] border border-[#d9c6bb] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#c85d6c] focus:ring-4 focus:ring-[#c85d6c]/10"
              disabled={disabled}
              autoFocus
            />
            <button
              type="button"
              onClick={handleCustomSend}
              disabled={disabled || !customText.trim()}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#07C160] text-white transition hover:bg-[#06AD56] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="发送"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setCustomText("");
              }}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] border border-[#d9c6bb] bg-white text-stone-500 transition hover:text-[#a83246]"
              aria-label="取消"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ReplyOption } from "@/lib/game/types";

interface OptionSelectorProps {
  options: ReplyOption[];
  onSelect: (text: string) => void;
  disabled: boolean;
}

export function OptionSelector({ options, onSelect, disabled }: OptionSelectorProps) {
  const [customText, setCustomText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleCustomSend = () => {
    if (!customText.trim()) return;
    onSelect(customText.trim());
    setCustomText("");
    setShowInput(false);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-3">
      {/* 选项列表 */}
      <div className="flex flex-col gap-2 mb-2">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.text)}
            disabled={disabled}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-50 hover:bg-[#95EC69]/20 hover:border-[#95EC69] text-gray-700 border border-gray-200 active:scale-[0.98]"
            }`}
          >
            <span className="text-gray-400 mr-2">{index + 1}.</span>
            {option.text}
          </button>
        ))}
      </div>

      {/* 自由输入切换 */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          disabled={disabled}
          className="w-full text-center text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors"
        >
          或者，自己说一句...
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
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#95EC69] focus:ring-1 focus:ring-[#95EC69]"
            disabled={disabled}
            autoFocus
          />
          <button
            onClick={handleCustomSend}
            disabled={disabled || !customText.trim()}
            className="px-4 py-2 bg-[#07C160] text-white rounded-lg text-sm font-medium hover:bg-[#06AD56] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
          <button
            onClick={() => {
              setShowInput(false);
              setCustomText("");
            }}
            className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

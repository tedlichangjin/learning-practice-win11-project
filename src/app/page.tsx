"use client";

import { useState } from "react";
import { StartPage } from "@/components/game/StartPage";
import { ChatInterface } from "@/components/game/ChatInterface";
import { useGameState } from "@/hooks/useGameState";

export default function Home() {
  const { state, startGame, sendReply, resetGame } = useGameState();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    await startGame();
    setIsLoading(false);
  };

  if (state.phase === "idle") {
    return <StartPage onStart={handleStart} isLoading={isLoading} />;
  }

  return (
    <ChatInterface
      state={state}
      sendReply={sendReply}
      resetGame={resetGame}
    />
  );
}

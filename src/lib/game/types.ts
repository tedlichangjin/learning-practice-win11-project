// ===== 游戏核心类型定义 =====

/** 人设模板 */
export type PersonalityId = "toxic" | "sensitive" | "cold";

export interface Personality {
  id: PersonalityId;
  name: string;
  description: string;
  systemPrompt: string;
  ttsSpeaker: string;
  imagePrompt: string;
}

/** 冲突场景 */
export interface Scenario {
  id: string;
  title: string;
  description: string;
  openingPrompt: string;
}

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  role: "user" | "partner";
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  timestamp: number;
}

/** 选项 */
export interface ReplyOption {
  id: string;
  text: string;
}

/** AI 回复结构 */
export interface AIResponse {
  text: string;
  mood: string;
  options: ReplyOption[];
  scoreChange: number;
  shouldEnd: boolean;
  endReason?: string;
}

/** 游戏状态 */
export interface GameState {
  phase: "idle" | "playing" | "ended";
  scenario: Scenario | null;
  personality: Personality | null;
  messages: ChatMessage[];
  currentOptions: ReplyOption[];
  currentScore: number;
  round: number;
  maxRounds: number;
  isPartnerTyping: boolean;
  isGeneratingVoice: boolean;
  isGeneratingImage: boolean;
  result: GameResult | null;
}

/** 游戏结果 */
export interface GameResult {
  finalScore: number;
  title: string;
  description: string;
  shareText: string;
  personalityName: string;
}

/** API 请求/响应类型 */
export interface StartGameResponse {
  scenario: Scenario;
  personality: Personality;
  firstMessage: ChatMessage;
  options: ReplyOption[];
  audioUrl?: string;
  imageUrl?: string;
}

export interface RespondRequestBody {
  message: string;
  history: Array<{ role: "user" | "partner"; text: string }>;
  scenarioId: string;
  personalityId: PersonalityId;
  currentScore: number;
  round: number;
}

export interface TTSRequestBody {
  text: string;
  personalityId: PersonalityId;
}

export interface ImageRequestBody {
  personalityId: PersonalityId;
  mood: string;
  context: string;
}

export interface ResultRequestBody {
  totalScore: number;
  roundCount: number;
  personalityId: PersonalityId;
  scenarioId: string;
  lastMood: string;
}

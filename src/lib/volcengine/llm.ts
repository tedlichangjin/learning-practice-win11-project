import OpenAI from "openai";

const apiKey = process.env.DOUBAO_API_KEY;
const baseURL = process.env.DOUBAO_BASE_URL;
const model = process.env.DOUBAO_LLM_MODEL;

if (!apiKey || !baseURL || !model) {
  throw new Error(
    "Missing required environment variables: DOUBAO_API_KEY, DOUBAO_BASE_URL, DOUBAO_LLM_MODEL"
  );
}

const resolvedApiKey = apiKey;
const resolvedBaseURL = baseURL;
const resolvedModel = model;

const client = new OpenAI({
  apiKey: resolvedApiKey,
  baseURL: resolvedBaseURL,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * 非流式聊天，返回完整文本
 */
export async function chat(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<string> {
  const response = await client.chat.completions.create({
    model: resolvedModel,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * 流式聊天，返回 AsyncIterable<string>
 */
export async function* chatStream(
  messages: ChatMessage[],
  options?: ChatOptions
): AsyncIterable<string> {
  const stream = await client.chat.completions.create({
    model: resolvedModel,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

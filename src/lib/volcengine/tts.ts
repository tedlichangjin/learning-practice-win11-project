import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const appId = process.env.DOUBAO_TTS_APPID;
const accessToken = process.env.DOUBAO_TTS_ACCESS_TOKEN;
const cluster = process.env.DOUBAO_TTS_CLUSTER;
const voiceType = process.env.DOUBAO_TTS_VOICE_TYPE;
const endpoint = process.env.DOUBAO_TTS_ENDPOINT;

if (!appId || !accessToken || !cluster || !voiceType || !endpoint) {
  throw new Error(
    "Missing required environment variables: DOUBAO_TTS_APPID, DOUBAO_TTS_ACCESS_TOKEN, DOUBAO_TTS_CLUSTER, DOUBAO_TTS_VOICE_TYPE, DOUBAO_TTS_ENDPOINT"
  );
}

export interface TTSOptions {
  text: string;
  uid?: string;
  voiceType?: string;
  speedRatio?: number;
}

export interface TTSResult {
  audioBase64: string;
  mimeType: string;
}

/**
 * 语音合成，返回 base64 编码的音频
 */
export async function synthesize(options: TTSOptions): Promise<TTSResult> {
  const reqId = uuidv4();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer;${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: {
        appid: appId,
        token: accessToken,
        cluster: cluster,
      },
      user: {
        uid: options.uid ?? "user-" + Date.now(),
      },
      audio: {
        voice_type: options.voiceType ?? voiceType,
        encoding: "mp3",
        speed_ratio: options.speedRatio ?? 1.0,
      },
      request: {
        reqid: reqId,
        text: options.text,
        operation: "query",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS failed: ${error}`);
  }

  const data = await response.json();

  if (data.code !== 3000) {
    throw new Error(`TTS error: ${data.message} (code: ${data.code})`);
  }

  return {
    audioBase64: data.data,
    mimeType: "audio/mp3",
  };
}

/**
 * 语音合成并保存到文件
 */
export async function synthesizeToFile(
  options: TTSOptions,
  filePath: string
): Promise<void> {
  const result = await synthesize(options);
  const buffer = Buffer.from(result.audioBase64, "base64");
  fs.writeFileSync(filePath, buffer);
}

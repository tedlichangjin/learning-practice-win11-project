const apiKey = process.env.DOUBAO_API_KEY;
const baseURL = process.env.DOUBAO_BASE_URL;
const model = process.env.DOUBAO_IMAGE_MODEL;

if (!apiKey || !baseURL || !model) {
  throw new Error(
    "Missing required environment variables: DOUBAO_API_KEY, DOUBAO_BASE_URL, DOUBAO_IMAGE_MODEL"
  );
}

export interface ImageGenerationOptions {
  prompt: string;
  size?: string;
  responseFormat?: "url" | "b64_json";
}

export interface ImageGenerationResult {
  url?: string;
  b64Json?: string;
}

/**
 * 生成图片，返回图片 URL 或 base64
 */
export async function generate(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const response = await fetch(`${baseURL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: options.prompt,
      size: options.size ?? "1024x1024",
      response_format: options.responseFormat ?? "url",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation failed: ${error}`);
  }

  const data = await response.json();

  if (options.responseFormat === "b64_json") {
    return { b64Json: data.data?.[0]?.b64_json };
  }

  return { url: data.data?.[0]?.url };
}

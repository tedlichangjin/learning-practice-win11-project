import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function testLLM() {
  console.log("\n=== LLM test ===");

  try {
    const { chat } = await import("./src/lib/volcengine/llm");

    const response = await chat(
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" },
      ],
      { temperature: 0.7 }
    );

    console.log(response);
  } catch (error: unknown) {
    console.error("LLM test failed:");
    console.error(getErrorMessage(error));
  }
}

async function testImage() {
  console.log("\n=== Image test ===");

  try {
    const { generate } = await import("./src/lib/volcengine/image");
    const result = await generate({
      prompt: "A cat",
      size: "1024x1024",
      responseFormat: "url",
    });

    console.log(result.url ?? "No URL returned");
  } catch (error: unknown) {
    console.error("Image test failed:");
    console.error(getErrorMessage(error));
  }
}

async function testTTS() {
  console.log("\n=== TTS test ===");

  try {
    const { synthesizeToFile } = await import("./src/lib/volcengine/tts");

    await synthesizeToFile(
      {
        text: "Hello world",
        uid: "test-user",
      },
      "test-tts-output.mp3"
    );

    if (fs.existsSync("test-tts-output.mp3")) {
      const stats = fs.statSync("test-tts-output.mp3");
      console.log(`file size: ${stats.size}`);
    }
  } catch (error: unknown) {
    console.error("TTS test failed:");
    console.error(getErrorMessage(error));
  }
}

async function main() {
  console.log("=== Volcengine API smoke test ===");
  console.log(`DOUBAO_API_KEY: ${process.env.DOUBAO_API_KEY ? "set" : "missing"}`);
  console.log(
    `DOUBAO_LLM_MODEL: ${process.env.DOUBAO_LLM_MODEL ? "set" : "missing"}`
  );
  console.log();

  await testLLM();
  await testImage();
  await testTTS();
}

main();

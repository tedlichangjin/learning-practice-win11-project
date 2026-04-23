import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testLLM() {
  console.log("\n=== 测试 1: LLM 聊天 ===");

  try {
    const { chat } = await import("./src/lib/volcengine/llm");

    const messages = [
      { role: "system" as const, content: "你是一个 helpful assistant。" },
      { role: "user" as const, content: "你好" },
    ];

    console.log("发送请求...");
    const response = await chat(messages, { temperature: 0.7 });

    console.log("✅ LLM 测试成功!");
    console.log("返回文本:", response);
  } catch (error: any) {
    console.error("❌ LLM 测试失败:");
    console.error("错误:", error.message);
  }
}

async function testImage() {
  console.log("\n=== 测试 2: 图片生成 ===");

  try {
    const { generate } = await import("./src/lib/volcengine/image");

    console.log("发送请求...");
    const result = await generate({
      prompt: "一只橘猫",
      size: "1024x1024",
      responseFormat: "url",
    });

    if (result.url) {
      console.log("✅ 图片生成成功!");
      console.log("图片 URL:", result.url);
    } else {
      console.error("❌ 图片生成失败: 未返回 URL");
    }
  } catch (error: any) {
    console.error("❌ 图片测试失败:");
    console.error("错误:", error.message);
  }
}

async function testTTS() {
  console.log("\n=== 测试 3: 语音合成 ===");

  try {
    const { synthesizeToFile } = await import("./src/lib/volcengine/tts");

    console.log("发送请求...");
    await synthesizeToFile(
      {
        text: "你好世界",
        uid: "test-user",
      },
      "test-tts-output.mp3"
    );

    console.log("✅ TTS 测试成功!");
    console.log("音频已保存为: test-tts-output.mp3");

    // 检查文件是否存在
    if (fs.existsSync("test-tts-output.mp3")) {
      const stats = fs.statSync("test-tts-output.mp3");
      console.log(`文件大小: ${stats.size} 字节`);
    }
  } catch (error: any) {
    console.error("❌ TTS 测试失败:");
    console.error("错误:", error.message);
  }
}

async function main() {
  console.log("=== 火山引擎 API 测试脚本 ===");
  console.log("环境变量检查:");
  console.log(`  DOUBAO_API_KEY: ${process.env.DOUBAO_API_KEY ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(`  DOUBAO_BASE_URL: ${process.env.DOUBAO_BASE_URL ? "✅ " + process.env.DOUBAO_BASE_URL : "❌ 未设置"}`);
  console.log(`  DOUBAO_LLM_MODEL: ${process.env.DOUBAO_LLM_MODEL ? "✅ " + process.env.DOUBAO_LLM_MODEL : "❌ 未设置 (需要先填写)"}`);
  console.log(`  DOUBAO_IMAGE_MODEL: ${process.env.DOUBAO_IMAGE_MODEL ? "✅ " + process.env.DOUBAO_IMAGE_MODEL : "❌ 未设置"}`);
  console.log(`  DOUBAO_TTS_APPID: ${process.env.DOUBAO_TTS_APPID ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(`  DOUBAO_TTS_ACCESS_TOKEN: ${process.env.DOUBAO_TTS_ACCESS_TOKEN ? "✅ 已设置" : "❌ 未设置"}`);

  if (!process.env.DOUBAO_LLM_MODEL) {
    console.log("\n⚠️  警告: DOUBAO_LLM_MODEL 未设置，LLM 测试将失败");
    console.log("   请在 .env.local 中填写你的豆包大模型 ID");
  }

  // 依次运行测试
  await testLLM();
  await testImage();
  await testTTS();

  console.log("\n=== 所有测试完成 ===");
}

main();

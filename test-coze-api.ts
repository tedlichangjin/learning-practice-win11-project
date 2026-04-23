import * as dotenv from "dotenv";
import * as path from "path";

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testCozeAPI() {
  console.log("=== Coze API 测试脚本 ===\n");

  // 1. 检查环境变量
  const apiKey = process.env.COZE_API_KEY || process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const baseUrl = process.env.COZE_API_BASE_URL || process.env.COZE_INTEGRATION_BASE_URL;

  console.log("环境变量检查:");
  console.log(`  COZE_API_KEY: ${apiKey ? "✅ 已设置 (" + apiKey.substring(0, 20) + "...)" : "❌ 未设置"}`);
  console.log(`  COZE_API_BASE_URL: ${baseUrl ? "✅ " + baseUrl : "❌ 未设置"}`);
  console.log(`  COZE_WORKLOAD_IDENTITY_API_KEY: ${process.env.COZE_WORKLOAD_IDENTITY_API_KEY ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(`  COZE_INTEGRATION_BASE_URL: ${process.env.COZE_INTEGRATION_BASE_URL ? "✅ " + process.env.COZE_INTEGRATION_BASE_URL : "❌ 未设置"}`);
  console.log();

  if (!apiKey) {
    console.error("❌ 错误: 未找到 API Key，请检查 .env.local 文件");
    process.exit(1);
  }

  // 2. 测试直接调用 Coze API
  console.log("测试调用 Coze API...");
  console.log(`请求 URL: ${baseUrl}/v3/chat`);
  console.log();

  try {
    // 注意：Coze v3/chat 接口需要 bot_id，这里我们先测试连接是否通
    const response = await fetch(`${baseUrl}/v3/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: "test", // 占位，用于测试连接
        user_id: "test-user",
        additional_messages: [
          { role: "user", content: "你好", content_type: "text" }
        ],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ API 连接成功!");
      console.log("响应:", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ API 返回错误:");
      console.error(`   状态码: ${response.status}`);
      console.error(`   错误码: ${data.code}`);
      console.error(`   错误信息: ${data.msg}`);
      console.error(`   Log ID: ${data.detail?.logid}`);

      if (data.code === 4101) {
        console.error("\n💡 提示: 认证失败 (4101)");
        console.error("   1. 请确认 PAT 令牌格式正确 (以 pat_ 开头)");
        console.error("   2. 请确认令牌未过期");
        console.error("   3. 请确认令牌有调用 API 的权限");
      }

      if (data.code === 4000) {
        console.error("\n💡 提示: 接口不存在 (4000)");
        console.error("   1. 请确认 Base URL 正确");
        console.error("   2. 请确认使用的是 POST 方法");
      }

      if (data.msg?.includes("bot_id")) {
        console.error("\n💡 提示: 需要提供有效的 bot_id");
        console.error("   请在扣子后台将 Bot 发布为 API，然后获取 bot_id");
      }
    }

  } catch (error: any) {
    console.error("❌ 请求失败:");
    console.error("错误类型:", error.constructor.name);
    console.error("错误信息:", error.message);

    if (error.message?.includes("ECONNREFUSED") || error.message?.includes("ENOTFOUND")) {
      console.error("\n💡 提示: 网络连接失败");
      console.error("   1. 请检查网络连接");
      console.error("   2. 请确认 api.coze.cn 可以访问");
    }
  }

  console.log("\n=== 测试完成 ===");
}

testCozeAPI();

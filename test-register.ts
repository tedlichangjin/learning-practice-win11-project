import * as dotenv from "dotenv";
import * as path from "path";

// 加载 .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testRegister() {
  console.log("=== 测试用户注册 ===\n");

  const baseUrl = "http://localhost:5000";
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "password123";

  console.log(`测试用户名: ${testUsername}`);
  console.log(`测试密码: ${testPassword}`);
  console.log();

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
      }),
    });

    const data = await response.json();

    console.log(`状态码: ${response.status}`);
    console.log("响应数据:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ 注册成功！");
      console.log(`用户ID: ${data.user?.id}`);
      console.log(`用户名: ${data.user?.username}`);
      console.log(`Token: ${data.token?.substring(0, 20)}...`);
    } else {
      console.log("\n❌ 注册失败:");
      console.log(`错误: ${data.error}`);
    }
  } catch (error: any) {
    console.error("\n❌ 请求失败:");
    console.error(error.message);
  }
}

async function testLogin() {
  console.log("\n\n=== 测试用户登录 ===\n");

  const baseUrl = "http://localhost:5000";
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "password123";

  // 先注册
  console.log("1. 先注册用户...");
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUsername, password: testPassword }),
  });

  if (!registerRes.ok) {
    console.log("注册失败，跳过登录测试");
    return;
  }

  console.log("✅ 注册成功\n");

  // 再登录
  console.log("2. 测试登录...");
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
      }),
    });

    const data = await response.json();

    console.log(`状态码: ${response.status}`);

    if (response.ok) {
      console.log("✅ 登录成功！");
      console.log(`用户ID: ${data.user?.id}`);
      console.log(`用户名: ${data.user?.username}`);
      console.log(`Token: ${data.token?.substring(0, 20)}...`);
    } else {
      console.log("❌ 登录失败:");
      console.log(`错误: ${data.error}`);
    }
  } catch (error: any) {
    console.error("❌ 请求失败:", error.message);
  }
}

async function main() {
  console.log("=== Supabase 注册/登录测试 ===\n");

  // 检查环境变量
  console.log("环境变量检查:");
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 已设置" : "❌ 未设置"}`);
  console.log();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ 环境变量未设置，测试中止");
    process.exit(1);
  }

  await testRegister();
  await testLogin();

  console.log("\n=== 测试完成 ===");
}

main();

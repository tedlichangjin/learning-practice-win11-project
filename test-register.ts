import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function testRegister() {
  console.log("=== Register test ===\n");

  const baseUrl = "http://localhost:5000";
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "password123";

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
    console.log(`status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    console.error("Register request failed:");
    console.error(getErrorMessage(error));
  }
}

async function testLogin() {
  console.log("\n=== Login test ===\n");

  const baseUrl = "http://localhost:5000";
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "password123";

  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUsername, password: testPassword }),
  });

  if (!registerRes.ok) {
    console.error("Register step failed, skipping login test");
    return;
  }

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
    console.log(`status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    console.error("Login request failed:");
    console.error(getErrorMessage(error));
  }
}

async function main() {
  const databaseUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

  console.log("=== Auth API test ===\n");
  console.log(`database url: ${databaseUrl ? "set" : "missing"}`);
  console.log();

  if (!databaseUrl) {
    console.error("Missing NEON_DATABASE_URL or DATABASE_URL");
    process.exit(1);
  }

  await testRegister();
  await testLogin();
}

main();

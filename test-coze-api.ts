import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function testCozeAPI() {
  console.log("=== Coze API smoke test ===\n");

  const apiKey =
    process.env.COZE_API_KEY ?? process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const baseUrl =
    process.env.COZE_API_BASE_URL ?? process.env.COZE_INTEGRATION_BASE_URL;

  console.log(`COZE_API_KEY: ${apiKey ? "set" : "missing"}`);
  console.log(`COZE_API_BASE_URL: ${baseUrl ?? "missing"}`);
  console.log();

  if (!apiKey || !baseUrl) {
    console.error("Missing Coze credentials in .env.local");
    process.exit(1);
  }

  try {
    const response = await fetch(`${baseUrl}/v3/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: "test",
        user_id: "test-user",
        additional_messages: [
          { role: "user", content: "hello", content_type: "text" },
        ],
      }),
    });

    const data = await response.json();
    console.log(`status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    console.error("Request failed:");
    console.error(getErrorMessage(error));
  }
}

testCozeAPI();

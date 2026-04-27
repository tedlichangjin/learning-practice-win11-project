import path from "path";

import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sourceUrl = process.env.SUPABASE_DB_URL;
const targetUrl = process.env.NEON_DATABASE_URL;

if (!sourceUrl) {
  throw new Error("SUPABASE_DB_URL is not set");
}

if (!targetUrl) {
  throw new Error("NEON_DATABASE_URL is not set");
}

const tableConfigs = [
  {
    table: "users",
    columns: ["id", "username", "password", "created_at"],
  },
  {
    table: "game_records",
    columns: ["id", "user_id", "scenario", "final_score", "result", "played_at"],
  },
  {
    table: "share_posts",
    columns: [
      "id",
      "title",
      "content",
      "cover_image_url",
      "author_name",
      "personality_type",
      "scenario_title",
      "final_score",
      "result_title",
      "share_text",
      "chat_messages",
      "like_count",
      "created_at",
    ],
  },
];

function createClient(connectionString) {
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

function buildInsertStatement(table, columns, rows) {
  const values = [];
  const placeholders = rows.map((row, rowIndex) => {
    const rowPlaceholders = columns.map((column, columnIndex) => {
      values.push(row[column]);
      return `$${rowIndex * columns.length + columnIndex + 1}`;
    });

    return `(${rowPlaceholders.join(", ")})`;
  });

  return {
    sql: `insert into ${table} (${columns.join(", ")}) values ${placeholders.join(", ")}`,
    values,
  };
}

async function getCounts(client) {
  const counts = {};

  for (const { table } of tableConfigs) {
    const result = await client.query(`select count(*)::int as count from ${table}`);
    counts[table] = result.rows[0].count;
  }

  return counts;
}

async function resetSequence(client, table) {
  await client.query(
    `select setval(pg_get_serial_sequence($1, 'id'), coalesce((select max(id) from ${table}), 1), (select count(*) > 0 from ${table}))`,
    [table]
  );
}

async function main() {
  const source = createClient(sourceUrl);
  const target = createClient(targetUrl);

  await source.connect();
  await target.connect();

  try {
    const targetCounts = await getCounts(target);
    const targetHasData = Object.values(targetCounts).some((count) => count > 0);

    if (targetHasData) {
      throw new Error(
        `Target Neon database is not empty: ${JSON.stringify(targetCounts)}`
      );
    }

    const exportData = {};

    for (const { table, columns } of tableConfigs) {
      const result = await source.query(
        `select ${columns.join(", ")} from ${table} order by id asc`
      );
      exportData[table] = result.rows;
      console.log(`fetched ${result.rowCount} rows from ${table}`);
    }

    await target.query("begin");

    for (const { table, columns } of tableConfigs) {
      const rows = exportData[table];
      if (rows.length === 0) {
        console.log(`skipped ${table} because it has no rows`);
        continue;
      }

      const { sql, values } = buildInsertStatement(table, columns, rows);
      await target.query(sql, values);
      console.log(`inserted ${rows.length} rows into ${table}`);
    }

    for (const { table } of tableConfigs) {
      await resetSequence(target, table);
      console.log(`reset sequence for ${table}`);
    }

    await target.query("commit");

    const sourceCounts = await getCounts(source);
    const finalTargetCounts = await getCounts(target);

    console.log("source counts:", JSON.stringify(sourceCounts));
    console.log("target counts:", JSON.stringify(finalTargetCounts));
  } catch (error) {
    await target.query("rollback").catch(() => {});
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

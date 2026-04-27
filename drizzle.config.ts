import { defineConfig } from "drizzle-kit";

const url = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL is required for drizzle-kit");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/storage/database/shared/schema.ts",
  out: "./src/storage/database/migrations",
  dbCredentials: {
    url,
  },
});

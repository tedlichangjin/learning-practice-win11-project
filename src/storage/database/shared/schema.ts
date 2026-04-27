import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: serial("id").primaryKey(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 200 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("users_username_idx").on(table.username)]
);

export const gameRecords = pgTable(
  "game_records",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scenario: varchar("scenario", { length: 100 }),
    final_score: integer("final_score").notNull(),
    result: varchar("result", { length: 20 }).notNull(),
    played_at: timestamp("played_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("game_records_user_id_idx").on(table.user_id),
    index("game_records_played_at_idx").on(table.played_at),
  ]
);

export const sharePosts = pgTable(
  "share_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    cover_image_url: varchar("cover_image_url", { length: 500 }),
    author_name: varchar("author_name", { length: 50 }).notNull(),
    personality_type: varchar("personality_type", { length: 50 }),
    scenario_title: varchar("scenario_title", { length: 100 }),
    final_score: integer("final_score"),
    result_title: varchar("result_title", { length: 100 }),
    share_text: varchar("share_text", { length: 500 }),
    chat_messages: text("chat_messages"),
    like_count: integer("like_count").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("share_posts_created_at_idx").on(table.created_at),
    index("share_posts_like_count_idx").on(table.like_count),
  ]
);

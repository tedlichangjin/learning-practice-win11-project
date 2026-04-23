import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, timestamp, integer, index } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 200 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_username_idx").on(table.username),
  ]
);

// 游戏记录表
export const gameRecords = pgTable(
  "game_records",
  {
    id: serial().primaryKey(),
    user_id: integer("user_id").notNull(),                               // 关联 users 表
    scenario: varchar("scenario", { length: 100 }),                      // 场景名称
    final_score: integer("final_score").notNull(),                       // 最终好感度分数
    result: varchar("result", { length: 20 }).notNull(),                 // 通关/失败
    played_at: timestamp("played_at", { withTimezone: true }).defaultNow().notNull(), // 游戏时间
  },
  (table) => [
    index("game_records_user_id_idx").on(table.user_id),
    index("game_records_played_at_idx").on(table.played_at),
  ]
);

// 分享博客表
export const sharePosts = pgTable(
  "share_posts",
  {
    id: serial().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),          // 博客标题
    content: text("content").notNull(),                           // 博客正文（Markdown）
    cover_image_url: varchar("cover_image_url", { length: 500 }), // 封面图 URL
    author_name: varchar("author_name", { length: 50 }).notNull(),// 作者昵称
    personality_type: varchar("personality_type", { length: 50 }),// 人设类型
    scenario_title: varchar("scenario_title", { length: 100 }),   // 冲突场景
    final_score: integer("final_score"),                          // 最终分数
    result_title: varchar("result_title", { length: 100 }),       // 结局标题
    share_text: varchar("share_text", { length: 500 }),           // 分享文案
    // 对话记录 JSON 数组
    chat_messages: text("chat_messages"),                         // JSON string of ChatMessage[]
    like_count: integer("like_count").default(0).notNull(),       // 点赞数
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("share_posts_created_at_idx").on(table.created_at),
    index("share_posts_like_count_idx").on(table.like_count),
  ]
);

-- ========================================================-- 哄她开心项目 - Supabase 数据库建表 SQL-- 执行方式：在 Supabase SQL Editor 中逐段执行-- ========================================================-- --------------------------------------------------------
-- 1. users 表 - 用户表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID，自增主键';
COMMENT ON COLUMN users.username IS '用户名，唯一';
COMMENT ON COLUMN users.password IS '密码（bcrypt哈希）';
COMMENT ON COLUMN users.created_at IS '注册时间';

-- --------------------------------------------------------
-- 2. game_records 表 - 游戏记录表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario VARCHAR(100),
    final_score INTEGER NOT NULL,
    result VARCHAR(20) NOT NULL CHECK (result IN ('通关', '失败')),
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE game_records IS '游戏记录表';
COMMENT ON COLUMN game_records.id IS '记录ID，自增主键';
COMMENT ON COLUMN game_records.user_id IS '用户ID，外键关联users表';
COMMENT ON COLUMN game_records.scenario IS '场景名称';
COMMENT ON COLUMN game_records.final_score IS '最终好感度分数';
COMMENT ON COLUMN game_records.result IS '游戏结果（通关/失败）';
COMMENT ON COLUMN game_records.played_at IS '游戏时间';

-- 索引
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_final_score ON game_records(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_played_at ON game_records(played_at DESC);

-- --------------------------------------------------------
-- 3. share_posts 表 - 分享帖子表（翻车现场）
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS share_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    cover_image_url VARCHAR(500),
    author_name VARCHAR(50) DEFAULT '匿名玩家',
    personality_type VARCHAR(50),
    scenario_title VARCHAR(100),
    final_score INTEGER,
    result_title VARCHAR(100),
    share_text VARCHAR(500),
    chat_messages TEXT,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 注释
COMMENT ON TABLE share_posts IS '分享帖子表（翻车现场）';
COMMENT ON COLUMN share_posts.id IS '帖子ID，自增主键';
COMMENT ON COLUMN share_posts.title IS '博客标题';
COMMENT ON COLUMN share_posts.content IS '正文（Markdown）';
COMMENT ON COLUMN share_posts.cover_image_url IS '封面图URL';
COMMENT ON COLUMN share_posts.author_name IS '作者昵称';
COMMENT ON COLUMN share_posts.personality_type IS '人设类型';
COMMENT ON COLUMN share_posts.scenario_title IS '冲突场景';
COMMENT ON COLUMN share_posts.final_score IS '最终分数';
COMMENT ON COLUMN share_posts.result_title IS '结局标题';
COMMENT ON COLUMN share_posts.share_text IS '分享文案';
COMMENT ON COLUMN share_posts.chat_messages IS '对话记录（JSON格式）';
COMMENT ON COLUMN share_posts.like_count IS '点赞数';
COMMENT ON COLUMN share_posts.created_at IS '创建时间';

-- 索引
CREATE INDEX IF NOT EXISTS idx_share_posts_created_at ON share_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_posts_like_count ON share_posts(like_count DESC);

-- --------------------------------------------------------
-- 4. 验证表结构
-- --------------------------------------------------------

-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 查看 users 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 查看 game_records 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'game_records'
ORDER BY ordinal_position;

-- 查看 share_posts 表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'share_posts'
ORDER BY ordinal_position;

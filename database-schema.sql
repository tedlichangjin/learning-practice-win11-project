-- Database schema for Neon PostgreSQL
-- Apply this against your Neon database before switching traffic.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario VARCHAR(100),
    final_score INTEGER NOT NULL,
    result VARCHAR(20) NOT NULL,
    played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS share_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(500),
    author_name VARCHAR(50) NOT NULL DEFAULT '匿名玩家',
    personality_type VARCHAR(50),
    scenario_title VARCHAR(100),
    final_score INTEGER,
    result_title VARCHAR(100),
    share_text VARCHAR(500),
    chat_messages TEXT,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_played_at ON game_records(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_posts_created_at ON share_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_posts_like_count ON share_posts(like_count DESC);

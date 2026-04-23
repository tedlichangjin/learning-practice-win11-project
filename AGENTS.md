# 哄她开心 - AI 对话小游戏

## 项目概览

这是一个以"哄生气对象"为题材的短局对话小游戏。采用类微信聊天界面，用户通过选择回复选项或自由输入，与 AI 扮演的生气对象进行 3-5 轮对话，最终获得戏剧化结果。

### 核心玩法
- 开局随机生成冲突场景和人设
- 每轮提供 5 个选项 + 自由输入
- 对方回复包含：文字 + 语音(TTS) + 随机自拍图
- 3-5 轮后给出结局评分和分享文案
- 结果可分享到"翻车现场"博客广场

### 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI 集成**: coze-coding-dev-sdk (LLM + TTS + 图片生成)
- **数据库**: Supabase (PostgreSQL + Drizzle ORM)

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── game/
│   │   │   ├── start/route.ts      # 开局：生成场景+人设+首条消息
│   │   │   ├── respond/route.ts     # 回复：SSE 流式生成对方回复
│   │   │   ├── tts/route.ts         # 语音：TTS 合成
│   │   │   ├── image/route.ts       # 图片：AI 生成自拍
│   │   │   ├── result/route.ts      # 结算：生成结局文案
│   │   │   ├── record/route.ts      # 保存游戏记录(POST)
│   │   │   └── records/route.ts     # 查询游戏记录列表(GET)
│   │   ├── auth/
│   │   │   ├── register/route.ts    # 用户注册
│   │   │   ├── login/route.ts       # 用户登录
│   │   │   └── me/route.ts          # 获取当前用户(GET) + 退出(POST)
│   │   └── share/
│   │       ├── route.ts             # 分享列表(GET) + 创建分享(POST)
│   │       └── [id]/route.ts        # 分享详情(GET) + 点赞(PATCH)
│   ├── share/
│   │   ├── page.tsx                 # 翻车现场列表页
│   │   └── [id]/page.tsx            # 博客详情页
│   ├── login/
│   │   └── page.tsx                 # 登录页面
│   ├── register/
│   │   └── page.tsx                 # 注册页面
│   ├── profile/
│   │   └── page.tsx                 # 个人页面（游戏历史记录）
│   ├── page.tsx                     # 首页（开始页/聊天页切换）
│   ├── layout.tsx                   # 根布局
│   └── globals.css                  # 全局样式
├── components/game/
│   ├── StartPage.tsx                # 开始页面（含翻车现场入口）
│   ├── ChatInterface.tsx            # 聊天主界面
│   ├── MessageBubble.tsx            # 消息气泡
│   ├── VoiceMessage.tsx             # 语音消息播放器
│   ├── TypingIndicator.tsx          # 输入中指示器
│   ├── OptionSelector.tsx           # 选项选择器+自由输入
│   ├── ScoreBar.tsx                 # 好感度分数条
│   └── ResultPage.tsx               # 结果页+分享到翻车现场
├── hooks/
│   └── useGameState.ts              # 游戏状态管理 Hook
├── lib/
│   ├── auth/
│   │   ├── password.ts              # bcrypt 密码哈希/校验
│   │   ├── session.ts               # 服务端会话管理（token 生成/解析）
│   │   └── client.ts                # 前端认证工具（localStorage + authFetch）
│   ├── game/
│   │   ├── types.ts                 # 类型定义
│   │   ├── scenarios.ts             # 10 个预设冲突场景
│   │   ├── personalities.ts         # 3 种人设模板（毒舌/敏感/冷淡）
│   │   └── prompts.ts               # LLM 系统提示词构建
│   └── utils.ts                     # 工具函数
└── storage/database/
    ├── shared/schema.ts             # 数据库 Schema (share_posts + users + game_records 表)
    └── supabase-client.ts           # Supabase 客户端
```

## 构建与测试命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（端口 5000，热更新）
pnpm build            # 生产构建
pnpm start            # 生产启动
pnpm lint             # ESLint 检查
pnpm ts-check         # TypeScript 类型检查
```

## API 接口清单

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/game/start` | POST | 开局，随机生成场景+人设+首条消息 |
| `/api/game/respond` | POST | SSE 流式回复，返回对方文字+选项+分数 |
| `/api/game/tts` | POST | 文字转语音 |
| `/api/game/image` | POST | AI 生成自拍图 |
| `/api/game/result` | POST | 生成游戏结局文案 |
| `/api/game/record` | POST | 保存游戏记录（需登录） |
| `/api/game/records` | GET | 查询当前用户游戏记录+统计（需登录） |
| `/api/leaderboard` | GET | 排行榜（前20名，所有人可看） |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/me` | GET | 获取当前登录用户 |
| `/api/auth/me` | POST | 退出登录 |
| `/api/share` | GET | 获取分享列表（支持 sort=latest/hot） |
| `/api/share` | POST | 创建新分享 |
| `/api/share/[id]` | GET | 获取分享详情 |
| `/api/share/[id]` | PATCH | 点赞 |

## 数据库

### share_posts 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| title | varchar(200) | 博客标题 |
| content | text | 正文（Markdown） |
| cover_image_url | varchar(500) | 封面图 |
| author_name | varchar(50) | 作者昵称 |
| personality_type | varchar(50) | 人设类型 |
| scenario_title | varchar(100) | 冲突场景 |
| final_score | integer | 最终分数 |
| result_title | varchar(100) | 结局标题 |
| share_text | varchar(500) | 分享文案 |
| chat_messages | text | 对话记录 JSON |
| like_count | integer | 点赞数 |
| created_at | timestamp | 创建时间 |

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| username | varchar(50) | 用户名（唯一） |
| password | varchar(200) | 密码（bcrypt 哈希） |
| created_at | timestamp | 注册时间 |

### game_records 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| user_id | integer | 关联 users 表 |
| scenario | varchar(100) | 场景名称 |
| final_score | integer | 最终好感度分数 |
| result | varchar(20) | 通关/失败 |
| played_at | timestamp | 游戏时间 |

## 关键设计决策

1. **状态管理**: 使用 React useState + useCallback，无外部状态库
2. **SSE 流式**: respond API 使用 SSE 协议，流式传输 AI 回复，前端解析完整 JSON 后再显示
3. **异步资源**: 语音和图片在文字回复完成后异步生成，不阻塞主流程
4. **LLM 模型**: 使用 `doubao-seed-2-0-lite-260215`，平衡速度与质量
5. **TTS 人设映射**: 每种人设对应不同的 TTS 声音
6. **图片概率**: 自拍图按 30-40% 概率随机出现，不强制每轮生成
7. **分享功能**: 游戏结束后可一键分享到"翻车现场"，自动生成博客内容和对话回放
8. **用户认证**: bcrypt 密码哈希 + localStorage token + Authorization header，注册/登录/退出完整流程
9. **游戏记录**: 已登录用户完成游戏后自动保存记录，未登录用户提示登录后可保存

## 代码风格指南

- 严格 TypeScript，禁止隐式 any
- 组件使用 "use client" 指令标记客户端组件
- 后端 SDK 调用必须使用 HeaderUtils.extractForwardHeaders 转发请求头
- 所有 AI 回复解析需要 JSON 容错处理
- 聊天界面模拟微信风格，使用 #95EC69 (绿) 和 #EDEDED (灰) 配色
- Supabase 客户端使用 getSupabaseClient() 获取实例

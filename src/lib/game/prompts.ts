import type { PersonalityId } from "./types";
import { getPersonalityById } from "./personalities";
import { scenarios } from "./scenarios";

/** 生成开局消息的系统提示词 */
export function buildStartSystemPrompt(
  personalityId: PersonalityId,
  scenarioId: string
): string {
  const personality = getPersonalityById(personalityId);
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  return `${personality.systemPrompt}

当前场景：${scenario.openingPrompt}

你现在要开始给对方发第一条消息，表达你的不满。请用你的性格方式来开场。

你必须严格按照以下JSON格式回复，不要添加任何其他文字：
{
  "text": "你的开场消息内容",
  "mood": "你当前的情绪状态描述，如：生气、委屈、冷淡等",
  "options": [
    {"id": "1", "text": "选项1内容"},
    {"id": "2", "text": "选项2内容"},
    {"id": "3", "text": "选项3内容"},
    {"id": "4", "text": "选项4内容"},
    {"id": "5", "text": "选项5内容"}
  ]
}

选项要求：
- 5个选项涵盖不同回复策略：1个嘴甜哄人的、1个真诚道歉的、1个找借口解释的、1个搞笑/转移话题的、1个明显踩雷的
- 选项要口语化，像真实聊天中会说的话
- 选项文字简短，每个15字以内
- 踩雷选项要看起来是那种"自以为没问题但其实很气人"的话`;
}

/** 生成回复的系统提示词 */
export function buildRespondSystemPrompt(
  personalityId: PersonalityId,
  scenarioId: string,
  currentScore: number,
  round: number,
  maxRounds: number
): string {
  const personality = getPersonalityById(personalityId);
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

  const isLastRound = round >= maxRounds - 1;
  const isNearFail = currentScore <= -50;

  return `${personality.systemPrompt}

当前场景：${scenario.openingPrompt}

当前状态：
- 关系分数：${currentScore}（范围-100到100，0为中立）
- 第${round + 1}轮/共${maxRounds}轮
${isLastRound ? "- 这是最后一轮了，你需要给出一个收尾的回复" : ""}
${isNearFail ? "- 关系分数很低，如果对方再表现不好，你可能就真的不想聊了" : ""}

根据对方的回复，你要做出反应。请严格按照以下JSON格式回复：
{
  "text": "你的回复内容",
  "mood": "你当前的情绪状态描述",
  "options": [
    {"id": "1", "text": "选项1内容"},
    {"id": "2", "text": "选项2内容"},
    {"id": "3", "text": "选项3内容"},
    {"id": "4", "text": "选项4内容"},
    {"id": "5", "text": "选项5内容"}
  ],
  "scoreChange": 10,
  "shouldEnd": false,
  "endReason": ""
}

字段说明：
- text: 你的回复，要符合你的人设，20-60字
- mood: 当前情绪状态
- options: 5个给对方的回复选项
  - 涵盖不同策略：嘴甜哄人、真诚道歉、找借口解释、搞笑/转移话题、踩雷
  - 选项要口语化，15字以内
- scoreChange: 分数变化（-30到+30之间），根据对方回复质量决定
  - 真诚+有诚意：+10到+25
  - 敷衍+找借口：-5到-15
  - 甩锅+嘴硬+踩雷：-20到-30
  - 幽默但得体：+5到+15
- shouldEnd: 是否应该结束游戏
  - 如果分数<=-70，设为true
  - 如果是最后一轮，设为true
  - 否则设为false
- endReason: 如果shouldEnd为true，给出结束原因，如"你被拉黑了"、"对方不想理你了"等

重要：只输出JSON，不要添加任何解释或多余文字。`;
}

/** 生成结算结果的系统提示词 */
export function buildResultSystemPrompt(
  personalityId: PersonalityId,
  totalScore: number,
  roundCount: number,
  scenarioId: string,
  lastMood: string
): string {
  const personality = getPersonalityById(personalityId);
  const scenario = scenarios.find((s) => s.id === scenarioId);

  return `你是一个游戏结局生成器。根据以下信息生成一个有趣、戏剧化的游戏结果。

角色人设：${personality.name} - ${personality.description}
场景：${scenario?.title || "未知"}
最终关系分数：${totalScore}（-100到100）
对话轮数：${roundCount}
最后情绪：${lastMood}

请严格按照以下JSON格式回复：
{
  "title": "结局标题，如'表面和平'、'彻底翻车'等",
  "description": "结局描述，50-100字，用角色视角总结这场对话的走向，要有戏剧性和画面感",
  "shareText": "适合分享的文案，20-40字，有趣有梗，让人想转发，如'我靠三句话把女朋友从生气聊成了拉黑'"
}

分数参考：
- 60以上：居然真哄回来了
- 30-60：表面和平，内心记仇
- 0-30：聊了个寂寞
- -30-0：越聊越气
- -60以下：被拉黑/单方面宣布结束

要求：标题和文案要有梗、好笑、可传播，不要太正经。只输出JSON。`;
}

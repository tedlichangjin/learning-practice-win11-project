import type { Scenario } from "./types";

export const scenarios: Scenario[] = [
  {
    id: "forgot-reply",
    title: "忘记回消息",
    description: "她发了一长串消息，你却已读不回了好几个小时",
    openingPrompt:
      "用户已读不回了好几个小时。你刚才发了一大段话分享今天的心情和事情，但对方一直没回复，明明在线却不理你。你现在很生气，质问对方为什么已读不回。",
  },
  {
    id: "perfunctory",
    title: "说话敷衍",
    description: "她兴奋地分享事情，你只回了'嗯''哦''好的'",
    openingPrompt:
      "对方说话非常敷衍。你刚才兴冲冲地告诉对方今天发生的好玩的事情，结果对方只回了'嗯''哦'，完全没有认真听你说话的感觉。你现在很不爽，开始阴阳怪气。",
  },
  {
    id: "late",
    title: "约会迟到",
    description: "约好了时间你却迟到了半小时",
    openingPrompt:
      "对方约会迟到了半小时。你们约好下午两点见面，结果对方两点半才到，连句像样的道歉都没有。你等了很久，心里又委屈又生气。",
  },
  {
    id: "ignore-mood",
    title: "没注意情绪",
    description: "她明显心情不好，你却完全没察觉还自顾自说话",
    openingPrompt:
      "对方完全没有注意到你的情绪。你今天心情很差，但对方不仅没发现，还在你面前开心地打游戏，完全沉浸在自己的世界里。你觉得被忽视了。",
  },
  {
    id: "broke-promise",
    title: "答应的事没做",
    description: "你答应她的事情又忘了",
    openingPrompt:
      "对方答应的事情又没做到。之前信誓旦旦说会帮你做一件事，结果又忘了，而且看起来完全不当回事。你已经不是第一次失望了。",
  },
  {
    id: "wrong-words",
    title: "说错话",
    description: "你在她面前说了句很不合适的话",
    openingPrompt:
      "对方说了很让人生气的话。刚才聊天时对方无意中说了句让你特别不舒服的话，虽然可能不是故意的，但真的踩到你的雷区了。你现在气得不想理人。",
  },
  {
    id: "gaming",
    title: "只顾打游戏",
    description: "你一整天都在打游戏，完全忽略了她",
    openingPrompt:
      "对方一整天都在打游戏。你今天想跟对方聊聊天，但对方从早到晚都在打游戏，发消息也不回，打电话也不接。你觉得自己还不如一个游戏重要。",
  },
  {
    id: "anniversary",
    title: "纪念日不上心",
    description: "今天是重要纪念日，你却毫无表示",
    openingPrompt:
      "对方对纪念日完全不上心。今天明明是一个很重要的纪念日，但对方好像完全忘记了，没有任何表示，甚至还跟你说今天好无聊。你觉得心都凉了。",
  },
  {
    id: "bad-photo-reply",
    title: "照片回复敷衍",
    description: "她精心拍了照片发给你，你的回复让人心寒",
    openingPrompt:
      "对方对照片的回复太敷衍了。你精心打扮，找了好角度拍了一张自拍照发给对方，结果对方就回了'还行'两个字。你觉得自己的一片心意被糟蹋了。",
  },
  {
    id: "not-listening",
    title: "没认真听她说话",
    description: "她在说重要的事，你却心不在焉",
    openingPrompt:
      "对方完全没有认真听你说话。你在跟对方说一件对你很重要的事情，但对方明显在走神，等你讲完了对方问你'啊你说什么？'。你觉得自己在对着墙说话。",
  },
];

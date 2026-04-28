export const PERSONA_IMAGES = [
  "/images/game/persona-life-01.png",
  "/images/game/persona-life-02.png",
  "/images/game/persona-life-03.png",
  "/images/game/persona-life-04.png",
  "/images/game/persona-life-05.png",
  "/images/game/persona-life-06.png",
  "/images/game/persona-life-07.png",
  "/images/game/persona-life-08.png",
  "/images/game/persona-life-09.png",
  "/images/game/persona-life-10.png",
  "/images/game/persona-life-11.png",
  "/images/game/persona-life-12.png",
] as const;

export const LOGIN_SLIDER_IMAGES = [
  PERSONA_IMAGES[5],
  PERSONA_IMAGES[7],
  PERSONA_IMAGES[10],
] as const;

export const REGISTER_SLIDER_IMAGES = [
  PERSONA_IMAGES[2],
  PERSONA_IMAGES[6],
  PERSONA_IMAGES[11],
] as const;

export const HOME_SLIDER_IMAGES = [
  PERSONA_IMAGES[0],
  PERSONA_IMAGES[1],
  PERSONA_IMAGES[3],
  PERSONA_IMAGES[10],
] as const;

export const CHAT_SLIDER_IMAGES = [
  PERSONA_IMAGES[4],
  PERSONA_IMAGES[5],
  PERSONA_IMAGES[7],
  PERSONA_IMAGES[8],
] as const;

export const COMMUNITY_IMAGES = [
  PERSONA_IMAGES[6],
  PERSONA_IMAGES[7],
  PERSONA_IMAGES[10],
  PERSONA_IMAGES[11],
] as const;

export const RESULT_SLIDER_IMAGES = [
  PERSONA_IMAGES[5],
  PERSONA_IMAGES[8],
  PERSONA_IMAGES[10],
] as const;

export function getPersonaImageByName(name?: string | null): string {
  if (name === "嘴硬毒舌型" || name === "毒舌小公主") {
    return PERSONA_IMAGES[5];
  }
  if (name === "委屈敏感型" || name === "敏感小可爱") {
    return PERSONA_IMAGES[7];
  }
  if (name === "冰山美人") {
    return PERSONA_IMAGES[3];
  }
  return PERSONA_IMAGES[10];
}

export function getCommunityFallbackImage(seed: number): string {
  return COMMUNITY_IMAGES[Math.abs(seed) % COMMUNITY_IMAGES.length];
}

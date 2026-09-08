export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

export const CATEGORIES = [
  {
    key: "ambience",
    label: "Ambience",
    index: "01"
  },
  {
    key: "taste",
    label: "Taste",
    index: "02"
  },
  {
    key: "service",
    label: "Service",
    index: "03"
  }
];

export const DEFAULT_BUSINESS = {
  id: "randomCafe",
  name: "randomCafe",
  city: "Hyderabad",
  tags: {
    ambience: ["cozy", "lively", "quiet"],
    taste: ["craazyy", "valid", "meh"],
    service: ["quick", "friendly", "slow"]
  }
};

export const TAG_EMOJIS = {
  // Ambience
  cozy: "☕",
  lively: "🎉",
  quiet: "🤫",
  chill: "🛋️",
  aesthetic: "✨",
  romantic: "🕯️",
  vibrant: "⚡",
  peaceful: "🌿",
  crowded: "👥",
  minimal: "🪴",

  // Taste
  craazyy: "🤤",
  crazy: "🤤",
  valid: "😋",
  meh: "😐",
  delicious: "😋",
  yummy: "🤤",
  fire: "🔥",
  bland: "🧂",
  sweet: "🍰",
  fresh: "🍓",
  top: "💯",
  mid: "🤷",
  bad: "🤢",

  // Service
  quick: "⚡",
  fast: "🚀",
  friendly: "😊",
  slow: "🐢",
  attentive: "🫡",
  welcoming: "🤗",
  rude: "😒",
  great: "⭐",
  laggy: "🐌",
};

export function getTagEmoji(tag, categoryKey = "", index = 0) {
  if (!tag) return "✨";
  const key = String(tag).toLowerCase().trim();
  if (TAG_EMOJIS[key]) return TAG_EMOJIS[key];

  const categoryFallbacks = {
    ambience: ["☕", "🎉", "🤫"],
    taste: ["🤤", "😋", "😐"],
    service: ["⚡", "😊", "🐢"],
  };

  const fallbacks = categoryFallbacks[categoryKey];
  if (fallbacks && fallbacks[index] !== undefined) {
    return fallbacks[index];
  }
  return "✨";
}


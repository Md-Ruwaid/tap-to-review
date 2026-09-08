export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

export const CATEGORIES = [
  {
    key: "ambience",
    label: "Ambience",
    description: "The vibe of the cafe",
    icon: "✨"
  },
  {
    key: "taste",
    label: "Taste",
    description: "How the flavors hit",
    icon: "☕"
  },
  {
    key: "service",
    label: "Service",
    description: "How was the staff",
    icon: "⚡"
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

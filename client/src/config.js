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

export const RARITY_CONFIG = {
  COMMON: {
    label: "Common",
    color: "#6B7280",
    bgMuted: "rgba(107,114,128,0.12)",
    borderClass: "border-rarity-common",
    textClass: "text-rarity-common",
    glow: "none",
    animationIntensity: "low",
  },
  UNCOMMON: {
    label: "Uncommon",
    color: "#10B981",
    bgMuted: "rgba(16,185,129,0.12)",
    borderClass: "border-rarity-uncommon",
    textClass: "text-rarity-uncommon",
    glow: "shadow-glow-green",
    animationIntensity: "medium",
  },
  RARE: {
    label: "Rare",
    color: "#3B82F6",
    bgMuted: "rgba(59,130,246,0.12)",
    borderClass: "border-rarity-rare",
    textClass: "text-rarity-rare",
    glow: "shadow-glow-blue",
    animationIntensity: "high",
  },
  EPIC: {
    label: "Epic",
    color: "#8B5CF6",
    bgMuted: "rgba(139,92,246,0.12)",
    borderClass: "border-rarity-epic",
    textClass: "text-rarity-epic",
    glow: "shadow-glow-purple",
    animationIntensity: "very-high",
  },
  LEGENDARY: {
    label: "Legendary",
    color: "#F59E0B",
    bgMuted: "rgba(245,158,11,0.12)",
    borderClass: "border-rarity-legendary",
    textClass: "text-rarity-legendary",
    glow: "shadow-glow-gold",
    animationIntensity: "max",
  },
} as const;

export type RarityTier = keyof typeof RARITY_CONFIG;

export function getRarityConfig(tier: RarityTier) {
  return RARITY_CONFIG[tier];
}

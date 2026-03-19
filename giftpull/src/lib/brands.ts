export const BRAND_CONFIG = {
  XBOX: { label: "Xbox", color: "#107C10", icon: "🎮" },
  STEAM: { label: "Steam", color: "#1B2838", icon: "🎮" },
  NINTENDO: { label: "Nintendo", color: "#E60012", icon: "🎮" },
  PLAYSTATION: { label: "PlayStation", color: "#003791", icon: "🎮" },
  GOOGLE_PLAY: { label: "Google Play", color: "#4285F4", icon: "📱" },
  AMAZON: { label: "Amazon", color: "#FF9900", icon: "📦" },
  APPLE: { label: "Apple", color: "#A2AAAD", icon: "🍎" },
  ROBLOX: { label: "Roblox", color: "#E2231A", icon: "🎮" },
  SPOTIFY: { label: "Spotify", color: "#1DB954", icon: "🎵" },
  NETFLIX: { label: "Netflix", color: "#E50914", icon: "🎬" },
} as const;

export type GiftCardBrand = keyof typeof BRAND_CONFIG;

export function getBrandConfig(brand: GiftCardBrand) {
  return BRAND_CONFIG[brand];
}

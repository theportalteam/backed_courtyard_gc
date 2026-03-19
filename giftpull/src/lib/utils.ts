import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("en-US").format(points);
}

export function generateFakeCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    COMMON: "#6B7280",
    UNCOMMON: "#10B981",
    RARE: "#3B82F6",
    EPIC: "#8B5CF6",
    LEGENDARY: "#F59E0B",
  };
  return colors[rarity] || colors.COMMON;
}

export function getRarityBorderClass(rarity: string): string {
  const classes: Record<string, string> = {
    COMMON: "border-gray-500",
    UNCOMMON: "border-success",
    RARE: "border-primary",
    EPIC: "border-epic",
    LEGENDARY: "border-warning",
  };
  return classes[rarity] || classes.COMMON;
}

export function getBrandColor(brand: string): string {
  const colors: Record<string, string> = {
    XBOX: "#107C10",
    STEAM: "#1B2838",
    NINTENDO: "#E60012",
    PLAYSTATION: "#003087",
    GOOGLE_PLAY: "#01875F",
    AMAZON: "#FF9900",
    APPLE: "#A2AAAD",
    ROBLOX: "#E2231A",
    SPOTIFY: "#1DB954",
    NETFLIX: "#E50914",
  };
  return colors[brand] || "#3B82F6";
}

export function getBrandDisplayName(brand: string): string {
  const names: Record<string, string> = {
    XBOX: "Xbox",
    STEAM: "Steam",
    NINTENDO: "Nintendo eShop",
    PLAYSTATION: "PlayStation Store",
    GOOGLE_PLAY: "Google Play",
    AMAZON: "Amazon",
    APPLE: "Apple/iTunes",
    ROBLOX: "Roblox",
    SPOTIFY: "Spotify",
    NETFLIX: "Netflix",
  };
  return names[brand] || brand;
}

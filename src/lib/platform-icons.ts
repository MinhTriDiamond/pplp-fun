import { 
  Sparkles, 
  UserCircle, 
  PlayCircle, 
  Gamepad2, 
  HeartHandshake, 
  Wheat, 
  GraduationCap, 
  Scale, 
  Leaf, 
  TrendingUp, 
  Landmark, 
  Sun, 
  ShoppingBag, 
  Wallet,
   Coins,
  type LucideIcon
} from "lucide-react";
import type { PlatformId } from "@/types/pplp.types";

export const platformIcons: Record<PlatformId, LucideIcon> = {
  ANGEL_AI: Sparkles,
  FUN_PROFILE: UserCircle,
  FUN_PLAY: PlayCircle,
  FUN_PLANET: Gamepad2,
  FUN_CHARITY: HeartHandshake,
  FUN_FARM: Wheat,
  FUN_ACADEMY: GraduationCap,
  FUN_LEGAL: Scale,
  FUN_EARTH: Leaf,
  FUN_TRADING: TrendingUp,
  FUN_INVEST: Landmark,
  FUNLIFE: Sun,
  FUN_MARKET: ShoppingBag,
  FUN_WALLET: Wallet,
   CAMLY_COIN: Coins,
};

export const platformColors: Record<PlatformId, string> = {
  ANGEL_AI: "text-sky-500",
  FUN_PROFILE: "text-cyan-500",
  FUN_PLAY: "text-pink-500",
  FUN_PLANET: "text-violet-500",
  FUN_CHARITY: "text-rose-500",
  FUN_FARM: "text-green-500",
  FUN_ACADEMY: "text-yellow-500",
  FUN_LEGAL: "text-blue-500",
  FUN_EARTH: "text-emerald-500",
  FUN_TRADING: "text-orange-500",
  FUN_INVEST: "text-indigo-500",
  FUNLIFE: "text-amber-500",
  FUN_MARKET: "text-teal-500",
  FUN_WALLET: "text-purple-500",
  CAMLY_COIN: "text-yellow-600",
};

export const platformBgColors: Record<PlatformId, string> = {
  ANGEL_AI: "bg-sky-100",
  FUN_PROFILE: "bg-cyan-100",
  FUN_PLAY: "bg-pink-100",
  FUN_PLANET: "bg-violet-100",
  FUN_CHARITY: "bg-rose-100",
  FUN_FARM: "bg-green-100",
  FUN_ACADEMY: "bg-yellow-100",
  FUN_LEGAL: "bg-blue-100",
  FUN_EARTH: "bg-emerald-100",
  FUN_TRADING: "bg-orange-100",
  FUN_INVEST: "bg-indigo-100",
  FUNLIFE: "bg-amber-100",
  FUN_MARKET: "bg-teal-100",
  FUN_WALLET: "bg-purple-100",
  CAMLY_COIN: "bg-yellow-100",
};

// Platform URLs for external links
export const platformUrls: Record<PlatformId, string> = {
  FUN_PROFILE: "https://fun.rich",
  FUN_FARM: "https://farm.fun.rich",
  FUN_PLAY: "https://play.fun.rich",
  FUN_WALLET: "https://wallet.fun.rich",
  FUN_PLANET: "https://planet.fun.rich",
  FUN_CHARITY: "https://charity.fun.rich",
  FUN_EARTH: "https://greenearth-fun.lovable.app",
  FUN_ACADEMY: "https://academy.fun.rich",
  ANGEL_AI: "https://angel.fun.rich",
  CAMLY_COIN: "https://camly.co",
  FUN_TRADING: "https://trading.fun.rich",
  FUN_INVEST: "https://invest.fun.rich",
  FUN_LEGAL: "https://legal.fun.rich",
  FUN_MARKET: "https://market.fun.rich",
  FUNLIFE: "https://life.fun.rich",
};

// Helper function to get icon by name (for JSON-defined icon names)
const iconNameMap: Record<string, LucideIcon> = {
  'sparkles': Sparkles,
  'user-circle': UserCircle,
  'play-circle': PlayCircle,
  'gamepad-2': Gamepad2,
  'heart-handshake': HeartHandshake,
  'wheat': Wheat,
  'graduation-cap': GraduationCap,
  'scale': Scale,
  'leaf': Leaf,
  'trending-up': TrendingUp,
  'landmark': Landmark,
  'sun': Sun,
  'shopping-bag': ShoppingBag,
  'wallet': Wallet,
   'coins': Coins,
};

export function getPlatformIcon(iconName: string): LucideIcon {
  return iconNameMap[iconName] || Sparkles;
}

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
  ANGEL_AI: "text-purple",
  FUN_PROFILE: "text-gold",
  FUN_PLAY: "text-love",
  FUN_PLANET: "text-love",
  FUN_CHARITY: "text-love",
  FUN_FARM: "text-earth",
  FUN_ACADEMY: "text-gold",
  FUN_LEGAL: "text-purple",
  FUN_EARTH: "text-earth",
  FUN_TRADING: "text-gold",
  FUN_INVEST: "text-purple",
  FUNLIFE: "text-gold",
  FUN_MARKET: "text-gold",
  FUN_WALLET: "text-gold",
   CAMLY_COIN: "text-gold",
};

export const platformBgColors: Record<PlatformId, string> = {
  ANGEL_AI: "bg-purple/10",
  FUN_PROFILE: "bg-gold/10",
  FUN_PLAY: "bg-love/10",
  FUN_PLANET: "bg-love/10",
  FUN_CHARITY: "bg-love/10",
  FUN_FARM: "bg-earth/10",
  FUN_ACADEMY: "bg-gold/10",
  FUN_LEGAL: "bg-purple/10",
  FUN_EARTH: "bg-earth/10",
  FUN_TRADING: "bg-gold/10",
  FUN_INVEST: "bg-purple/10",
  FUNLIFE: "bg-gold/10",
  FUN_MARKET: "bg-gold/10",
  FUN_WALLET: "bg-gold/10",
   CAMLY_COIN: "bg-gold/10",
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

import { Sun } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

export function Logo({ size = "md", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-spiritual opacity-20 blur-md animate-pulse-slow" />
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center rounded-full bg-gradient-spiritual p-2">
          <Sun className="h-full w-full text-white" strokeWidth={1.5} />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold ${textSizeClasses[size]} bg-gradient-spiritual bg-clip-text text-transparent`}>
            FUN
          </span>
          {size !== "sm" && (
            <span className="text-xs text-muted-foreground -mt-1">
              Ecosystem
            </span>
          )}
        </div>
      )}
    </div>
  );
}
